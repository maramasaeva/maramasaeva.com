import type { ActivityItem } from "./types"
import { REVALIDATE, UA } from "./types"

/* Events come from one .ics feed (ACTIVITY_ICAL_URL). That feed is a whole
   personal calendar, so only entries that are plainly public events pass:
   ones that link to an event platform, or that carry a #public tag. Flights,
   calls, appointments and anything else never leave the server. */

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

type VEvent = {
  summary: string
  start: Date
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

/** DTSTART variants: 20260910, 20260910T190000, 20260910T170000Z, with ;TZID= or ;VALUE=DATE params. */
function parseDate(params: string, value: string): { date: Date; allDay: boolean } | null {
  const v = value.trim()
  const allDay = /VALUE=DATE(?!-TIME)/.test(params) || /^\d{8}$/.test(v)
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h = "12", mi = "00", s = "00", z] = m
  const date = z
    ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
    : /* floating or TZID: treated as local-ish; the panel shows the day only */
      new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
  return isNaN(date.getTime()) ? null : { date, allDay }
}

function parse(ics: string): VEvent[] {
  const out: VEvent[] = []
  for (const block of unfold(ics).matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)) {
    const props: Record<string, { params: string; value: string }> = {}
    for (const line of block[1].split(/\r?\n/)) {
      const m = line.match(/^([A-Z-]+)((?:;[^:]*)?):(.*)$/)
      if (m) props[m[1]] = { params: m[2], value: m[3] }
    }
    const dt = props.DTSTART && parseDate(props.DTSTART.params, props.DTSTART.value)
    if (!dt || !props.SUMMARY) continue
    if (props.STATUS?.value === "CANCELLED") continue
    out.push({
      summary: unescape(props.SUMMARY.value),
      start: dt.date,
      allDay: dt.allDay,
      location: props.LOCATION ? unescape(props.LOCATION.value) : undefined,
      url: props.URL?.value.trim() || undefined,
      description: props.DESCRIPTION ? unescape(props.DESCRIPTION.value) : undefined,
      uid: props.UID?.value ?? `${props.SUMMARY.value}-${props.DTSTART.value}`,
    })
  }
  return out
}

export async function fetchEvents(): Promise<ActivityItem[]> {
  const url = process.env.ACTIVITY_ICAL_URL
  if (!url) return []

  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: REVALIDATE },
  })
  if (!res.ok) throw new Error(`ical ${res.status}`)
  const events = parse(await res.text())

  const now = Date.now()
  const from = now - PAST_DAYS * 864e5
  const to = now + AHEAD_DAYS * 864e5

  const items: ActivityItem[] = []
  for (const e of events) {
    if (e.start.getTime() < from || e.start.getTime() > to) continue
    const link = eventLink(e.url, e.description, e.location)
    const tagged = PUBLIC_TAG.test(e.summary) || PUBLIC_TAG.test(e.description ?? "")
    if (!link && !tagged) continue
    const upcoming = e.start.getTime() > now
    const summary = e.summary.replace(PUBLIC_TAG, "").replace(/\s{2,}/g, " ").trim()
    const where = e.location && !/^https?:/.test(e.location) ? ` · ${e.location.split(",")[0]}` : ""
    items.push({
      id: `calendar-${e.uid}`,
      source: "calendar",
      category: "events",
      title: `${upcoming ? "going to" : "was at"} ${summary.toLowerCase()}${where}`,
      timestamp: e.start.toISOString(),
      url: link ?? e.url,
      upcoming,
    })
  }
  return items
}
