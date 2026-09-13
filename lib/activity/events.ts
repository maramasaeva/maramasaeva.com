import type { ActivityItem } from "./types"
import { REVALIDATE, UA } from "./types"
import { calendar } from "@/lib/data"

/* Events come from one or more .ics feeds (ACTIVITY_ICAL_URL, comma-separated:
   the google calendar plus partiful's feed). Those feeds are a whole personal
   agenda, so only entries that are plainly events pass: ones that link to an
   event platform, carry a #public tag, or are listed in `calendar.show` in
   lib/data.ts. Flights, calls, appointments and anything else never leave the
   server. Entries i registered for but skipped are dropped via `calendar.skip`
   or a #skip tag on the calendar entry. */

const EVENT_HOSTS = [
  "lu.ma",
  "luma.com",
  "eventbrite.",
  "meetup.com",
  "partiful.com",
  "ra.co",
  "dice.fm",
  "ticketmaster.",
  "ticketswap.",
  "shotgun.live",
  "posthog.com/events",
  "eventix.",
]
const PUBLIC_TAG = /#public\b/i
const SKIP_TAG = /#skip\b/i

/** first url in the text that points at an event platform */
function eventLink(...texts: (string | undefined)[]): string | undefined {
  for (const t of texts) {
    if (!t) continue
    for (const m of t.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
      const url = m[0].replace(/[.,;]+$/, "")
      /* drop personal tracking params (luma's ?pk=...) so the link is just the event */
      if (EVENT_HOSTS.some((h) => url.includes(h))) return url.split("?")[0]
    }
  }
  return undefined
}

const PAST_DAYS = 120
const AHEAD_DAYS = 60
const DEFAULT_LENGTH_MS = 3 * 36e5

type VEvent = {
  summary: string
  start: Date
  end: Date
  allDay: boolean
  location?: string
  url?: string
  description?: string
  uid: string
}

/** ics folds long lines with CRLF + whitespace; undo that first. */
const unfold = (ics: string) => ics.replace(/\r?\n[ \t]/g, "")

const unescape = (s: string) =>
  s.replace(/\\n/g, " ").replace(/\\([,;\\])/g, "$1").trim()

/** offset of `tz` at the given instant, in minutes east of UTC */
function tzOffset(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at)
  const get = (t: string) => +parts.find((p) => p.type === t)!.value
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  return Math.round((asUtc - at.getTime()) / 6e4)
}

/** wall-clock time in `tz` -> instant. Two passes handle the DST edge. */
function zoned(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s)
  try {
    const off = tzOffset(new Date(guess), tz)
    const first = guess - off * 6e4
    return new Date(first - (tzOffset(new Date(first), tz) - off) * 6e4)
  } catch {
    return new Date(guess)
  }
}

/** YYYY-MM-DD of an instant as seen in `tz` */
function dayIn(at: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at)
  } catch {
    return at.toISOString().slice(0, 10)
  }
}

/** DTSTART/DTEND variants: 20260910, 20260910T190000, 20260910T170000Z,
    with ;TZID= or ;VALUE=DATE params. Floating times use the feed's timezone. */
function parseDate(params: string, value: string, feedTz: string): { date: Date; allDay: boolean } | null {
  const v = value.trim()
  const allDay = /VALUE=DATE(?!-TIME)/.test(params) || /^\d{8}$/.test(v)
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h = "00", mi = "00", s = "00", z] = m
  const tzid = params.match(/TZID=([^;:]+)/)?.[1]
  const date = z
    ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
    : allDay
      ? zoned(+y, +mo, +d, 0, 0, 0, calendar.tz)
      : zoned(+y, +mo, +d, +h, +mi, +s, tzid ?? feedTz)
  return isNaN(date.getTime()) ? null : { date, allDay }
}

/** PT2H, P1DT3H30M, ... -> ms */
function parseDuration(v: string): number | null {
  const m = v.trim().match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/)
  if (!m) return null
  const [, d = 0, h = 0, mi = 0, s = 0] = m
  return ((+d * 24 + +h) * 60 + +mi) * 6e4 + +s * 1e3
}

function parse(ics: string): VEvent[] {
  const out: VEvent[] = []
  const flat = unfold(ics)
  const feedTz = flat.match(/^X-WR-TIMEZONE:(.+)$/m)?.[1].trim() ?? calendar.tz
  for (const block of flat.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)) {
    const props: Record<string, { params: string; value: string }> = {}
    for (const line of block[1].split(/\r?\n/)) {
      const m = line.match(/^([A-Z-]+)((?:;[^:]*)?):(.*)$/)
      if (m) props[m[1]] = { params: m[2], value: m[3] }
    }
    const dt = props.DTSTART && parseDate(props.DTSTART.params, props.DTSTART.value, feedTz)
    if (!dt || !props.SUMMARY) continue
    if (props.STATUS?.value === "CANCELLED") continue
    const dtEnd = props.DTEND && parseDate(props.DTEND.params, props.DTEND.value, feedTz)
    const dur = props.DURATION && parseDuration(props.DURATION.value)
    const end = dtEnd
      ? dtEnd.date
      : new Date(dt.date.getTime() + (dur || (dt.allDay ? 864e5 : DEFAULT_LENGTH_MS)))
    out.push({
      summary: unescape(props.SUMMARY.value).replace(/\s*\|\s*partiful$/i, ""),
      start: dt.date,
      end,
      allDay: dt.allDay,
      location: props.LOCATION ? unescape(props.LOCATION.value) : undefined,
      url: props.URL?.value.trim() || undefined,
      description: props.DESCRIPTION ? unescape(props.DESCRIPTION.value) : undefined,
      uid: props.UID?.value ?? `${props.SUMMARY.value}-${props.DTSTART.value}`,
    })
  }
  return out
}

const feedUrls = () =>
  (process.env.ACTIVITY_ICAL_URL ?? "")
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((u) => u.replace(/^webcal:\/\//i, "https://"))

async function fetchFeed(url: string): Promise<VEvent[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: REVALIDATE },
  })
  if (!res.ok) throw new Error(`ical ${res.status}`)
  return parse(await res.text())
}

const listed = (list: string[], ...texts: (string | undefined)[]) =>
  list.some((frag) => texts.some((t) => t?.toLowerCase().includes(frag.toLowerCase())))

const shownAs = (...texts: (string | undefined)[]) =>
  calendar.show
    .map((s) => (typeof s === "string" ? { match: s } : s))
    .find((s) => listed([s.match], ...texts))

/** venue only: no urls, no "location available once rsvp'd", no door codes */
function place(location?: string): string {
  if (!location || /^https?:/.test(location)) return ""
  if (/available once|secret|tbd|tba|announced/i.test(location)) return ""
  const first = location.split(",")[0].replace(/\s*\([^)]*\)/g, "").trim()
  return first ? ` · ${first}` : ""
}

export async function fetchEvents(): Promise<ActivityItem[]> {
  const urls = feedUrls()
  if (urls.length === 0) return []

  const feeds = await Promise.allSettled(urls.map(fetchFeed))
  const events = feeds.flatMap((f) => (f.status === "fulfilled" ? f.value : []))
  if (feeds.every((f) => f.status === "rejected")) throw new Error("all ical feeds failed")

  const now = Date.now()
  const today = dayIn(new Date(now), calendar.tz)
  const from = now - PAST_DAYS * 864e5
  const to = now + AHEAD_DAYS * 864e5

  /* the same event often sits in two feeds (partiful + the google copy);
     the event link is the identity */
  const seen = new Set<string>()
  const items: ActivityItem[] = []
  for (const e of events) {
    if (e.start.getTime() < from || e.start.getTime() > to) continue
    const link = eventLink(e.url, e.description, e.location)
    const text = `${e.summary} ${e.description ?? ""}`
    if (SKIP_TAG.test(text) || listed(calendar.skip, e.summary, link)) continue
    const manual = shownAs(e.summary, link)
    if (!link && !manual && !PUBLIC_TAG.test(text)) continue
    const key = link ?? e.uid
    if (seen.has(key)) continue
    seen.add(key)

    const upcoming = e.end.getTime() > now
    const day = dayIn(e.start, calendar.tz)
    const summary = (manual?.title ?? e.summary).replace(PUBLIC_TAG, "").replace(/\s{2,}/g, " ").trim()
    const where = place(e.location)
    items.push({
      id: `calendar-${e.uid}`,
      source: "calendar",
      category: "events",
      title: `${upcoming ? "might be at" : "was at"} ${summary.toLowerCase()}${where}`,
      timestamp: e.start.toISOString(),
      day,
      url: link ?? manual?.url ?? e.url,
      upcoming,
      today: upcoming && day === today,
    })
  }

  /* hand-listed events that were never in a calendar */
  for (const x of calendar.extra) {
    const [y, mo, d] = x.date.split("-").map(Number)
    const start = zoned(y, mo, d, 0, 0, 0, calendar.tz)
    if (start.getTime() < from || start.getTime() > to) continue
    const upcoming = start.getTime() + 864e5 > now
    items.push({
      id: `calendar-extra-${x.date}-${x.title}`,
      source: "calendar",
      category: "events",
      title: `${upcoming ? "might be at" : "was at"} ${x.title.toLowerCase()}${x.location ? ` · ${x.location}` : ""}`,
      timestamp: start.toISOString(),
      day: x.date,
      url: x.url,
      upcoming,
      today: upcoming && x.date === today,
    })
  }
  return items
}
