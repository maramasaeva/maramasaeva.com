import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import {
  BODY_MAX,
  DEFAULT_NAME,
  GLOBAL_LIMIT,
  GLOBAL_WINDOW_MS,
  NAME_MAX,
  RATE_LIMIT,
  RATE_WINDOW_MS,
  configured,
  countRecent,
  insertMessage,
  listMessages,
} from "@/lib/prikbord"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })

export async function GET() {
  try {
    return json({ messages: await listMessages(), enabled: configured() })
  } catch (err) {
    console.warn("[prikbord]", err instanceof Error ? err.message : err)
    return json({ messages: [], enabled: false }, 500)
  }
}

/* ---- input cleaning --------------------------------------------------------
   Everything below is defence against people, not against the database: the
   rows are inserted as json and rendered as react text, so nothing here can
   run. What it prevents is text that looks like something it is not. */

const MAX_PAYLOAD = 4096

/* bidi overrides (make text render in a different order than it is stored),
   zero-width and other invisible format characters, and control characters */
const INVISIBLE =
  /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff\ufff9-\ufffb]/g
/* runs of combining marks ("zalgo"): keep at most two per base character */
const MARK_PILE = /(\p{M}{2})\p{M}+/gu

const tidy = (s: unknown, max: number) =>
  String(typeof s === "string" ? s : "")
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .replace(MARK_PILE, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max)

/* something a reader can actually see: a letter, a digit or an emoji */
const VISIBLE = /[\p{L}\p{N}\p{Extended_Pictographic}]/u

/* links are the phishing / doxxing vector on an anonymous board; the text is
   never linkified, but a pasted address is still a pasted address */
const LINK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|xyz|ru|me|co|link|ly|gg|dev|app|site|online|info|be|nl|to|cc|tk|top|club|live|page|sh|ai)\b/i

/* nobody gets to sign as the owner or as staff */
const RESERVED = /mara|messier|masaeva|rssmrm|admin|moderat|\bmod\b|owner|official|claude|system/i

/* ---- who is asking ----------------------------------------------------------
   Vercel sets x-real-ip and x-forwarded-for itself and drops client-supplied
   ones. IPv6 users get a new address per connection inside their /64, so the
   hash covers the prefix only. The raw ip is never stored. */
function ipHash(req: NextRequest) {
  let ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  if (ip.includes(":")) ip = ip.split(":").slice(0, 4).join(":")
  return createHash("sha256")
    .update(`${ip}${process.env.PRIKBORD_SALT ?? ""}`)
    .digest("hex")
}

/* only the site's own page may post: browsers label cross-site requests, and
   an origin header that does not match the host is a form on someone else's page */
function sameSite(req: NextRequest) {
  const fetchSite = req.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none")
    return false
  const origin = req.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  if (!configured()) return json({ error: "prikbord is not configured" }, 503)
  if (!sameSite(req)) return json({ error: "post from the site itself" }, 403)
  if (!req.headers.get("content-type")?.includes("application/json"))
    return json({ error: "send json" }, 415)
  if (Number(req.headers.get("content-length") ?? 0) > MAX_PAYLOAD)
    return json({ error: "too long" }, 413)

  let payload: Record<string, unknown>
  try {
    const raw = await req.text()
    if (raw.length > MAX_PAYLOAD) return json({ error: "too long" }, 413)
    payload = JSON.parse(raw) as Record<string, unknown>
    if (!payload || typeof payload !== "object") throw new Error()
  } catch {
    return json({ error: "bad json" }, 400)
  }

  /* honeypot: real people never see this field; pretend it worked */
  if (payload.website) return json({ ok: true }, 201)

  const body = tidy(payload.body, BODY_MAX + 1)
  const name = tidy(payload.name, NAME_MAX + 1).replace(/\n/g, " ") || DEFAULT_NAME
  if (!body || !VISIBLE.test(body)) return json({ error: "say something first" }, 400)
  if (body.length > BODY_MAX) return json({ error: `keep it under ${BODY_MAX} characters` }, 400)
  if (name.length > NAME_MAX) return json({ error: `name under ${NAME_MAX} characters` }, 400)
  if (LINK.test(body) || LINK.test(name)) return json({ error: "no links on the board" }, 400)
  if (RESERVED.test(name)) return json({ error: "that name is taken" }, 400)

  const hash = ipHash(req)
  try {
    const [mine, everyone] = await Promise.all([
      countRecent(hash, RATE_WINDOW_MS),
      countRecent(null, GLOBAL_WINDOW_MS),
    ])
    if (mine >= RATE_LIMIT) return json({ error: "that's a lot of messages; try again in a bit" }, 429)
    if (everyone >= GLOBAL_LIMIT) return json({ error: "the board is busy; try again later" }, 429)
    const message = await insertMessage({ name, body, ipHash: hash })
    return json({ message }, 201)
  } catch (err) {
    console.warn("[prikbord]", err instanceof Error ? err.message : err)
    return json({ error: "could not save, try again" }, 500)
  }
}
