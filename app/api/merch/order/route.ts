import { createHash, randomBytes } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { PAYPAL, currencyOf, mailFields, paypalFields, validateOrder } from "@/lib/merch"

export const dynamic = "force-dynamic"

const MAX_BODY = 6000
const NO_STORE = { "Cache-Control": "no-store" }

const hits = new Map<string, number[]>()

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE })
}

function sameSite(req: NextRequest) {
  const fetchSite = req.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none")
    return false
  const origin = req.headers.get("origin")
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

function tooMany(req: NextRequest) {
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  const key = createHash("sha256").update(`merch\0${ip}`).digest("hex")
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000)
  if (recent.length >= 8) return true
  recent.push(now)
  hits.set(key, recent)
  return false
}

function orderId() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
  return Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("")
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function payPage(fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`)
    .join("")
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>pay</title><body><p>continuing to paypal.</p><form action="https://www.paypal.com/cgi-bin/webscr" method="post" accept-charset="utf-8">${inputs}<button type="submit">pay</button></form><script>document.forms[0].submit()</script></body></html>`
  return new NextResponse(html, {
    status: 200,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  })
}

function fail(message: string, status: number, html: boolean) {
  if (!html) return json({ error: message }, status)
  const page = `<!doctype html><html lang="en"><meta charset="utf-8"><title>order</title><body><p>${esc(message)}</p><p><a href="/merch">back</a></p></body></html>`
  return new NextResponse(page, {
    status,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  })
}

/* FormSubmit rejects a bare server fetch. The order was placed on the site,
   so the call carries that page as its referrer. */
async function send(fields: Record<string, string>) {
  const res = await fetch(`https://formsubmit.co/ajax/${PAYPAL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://maramasaeva.com",
      Referer: "https://maramasaeva.com/merch",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify(fields),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  })
  const data = (await res.json().catch(() => null)) as { success?: boolean | string; message?: string } | null
  const ok = res.ok && data?.success !== false && data?.success !== "false"
  if (!ok) console.warn("[merch] mail failed", res.status, data?.message ?? "")
  return ok
}

export async function POST(req: NextRequest) {
  const html = !req.headers.get("content-type")?.includes("application/json")
  if (!sameSite(req)) return fail("order from the site itself", 403, html)
  if (tooMany(req)) return fail("too many orders from here. try again in a bit", 429, html)

  let payload: Record<string, unknown>
  try {
    const type = req.headers.get("content-type") ?? ""
    if (type.includes("application/json")) {
      const raw = await req.text()
      if (raw.length > MAX_BODY) return fail("too long", 413, html)
      payload = JSON.parse(raw) as Record<string, unknown>
    } else if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await req.formData()
      payload = {}
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") payload[key] = value
      }
    } else {
      return fail("send the order as a form", 415, html)
    }
    if (!payload || typeof payload !== "object") throw new Error()
  } catch {
    return fail("that order could not be read", 400, html)
  }

  if (payload.hp) {
    if (!html) return json({ skip: true })
    const page = `<!doctype html><html lang="en"><meta charset="utf-8"><title>order</title><body><p>ok</p></body></html>`
    return new NextResponse(page, { status: 200, headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" } })
  }

  const currency = currencyOf(payload.pay)
  if (!currency) return fail("pick a way to pay", 400, html)
  const parsed = validateOrder(payload)
  if (!parsed.ok) return fail(parsed.error, 400, html)

  const id = orderId()
  const fields = paypalFields(parsed.order, id, currency)
  try {
    await send(mailFields(parsed.order, id, currency))
  } catch (err) {
    console.warn("[merch] mail failed", err instanceof Error ? err.message : err)
  }

  if (html) return payPage(fields)
  return json({ id, paypal: fields })
}
