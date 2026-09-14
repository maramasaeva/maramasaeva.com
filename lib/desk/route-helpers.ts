import { NextResponse, type NextRequest } from "next/server"
import { isDesk } from "./auth"


const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }
export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })

/* browsers label cross-site requests; the desk only answers its own page */
export function sameSite(req: NextRequest) {
  const fetchSite = req.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") return false
  const origin = req.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

/** null when the caller may proceed, otherwise the response to send */
export async function guard(req: NextRequest, { needBody = true } = {}): Promise<NextResponse | null> {
  if (!sameSite(req)) return json({ error: "cross-site request" }, 403)
  if (!(await isDesk())) return json({ error: "not signed in" }, 401)
  if (needBody && !(req.headers.get("content-type") ?? "").startsWith("application/json"))
    return json({ error: "send json" }, 415)
  return null
}

export async function readJson<T>(req: NextRequest, max = 16_384): Promise<T | null> {
  const raw = await req.text()
  if (raw.length > max) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
