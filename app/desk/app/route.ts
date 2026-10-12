import { isDesk } from "@/lib/desk/auth"
import { boundedText, gatewayConfig, websiteHtml } from "@/lib/dashboard/proxy"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
const HEADERS = { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "text/html; charset=utf-8" }

export async function GET(req: Request) {
  if (!(await isDesk())) return new Response("Not found", { status: 404, headers: HEADERS })
  const config = gatewayConfig()
  const unavailable = () => new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Desk unavailable</title><main style="font:18px system-ui;max-width:550px;margin:10vh auto;padding:24px"><h1>Your messaging host is unavailable.</h1><p>No message was sent. The background host must be online, and its private gateway connected to this website.</p><p><a href="/desk/app">Try again</a> · <a href="/desk/x">X public replies</a> · <a href="/">Website</a></p></main>', { status: 503, headers: HEADERS })
  if (!config) return unavailable()
  try {
    const upstream = await fetch(`${config.origin}/dashboard-shell`, {
      headers: { Authorization: `Bearer ${config.token}`, "ngrok-skip-browser-warning": "dashboard" },
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15_000),
    })
    if (!upstream.ok || !upstream.headers.get("content-type")?.includes("text/html")) return unavailable()
    const html = websiteHtml(await boundedText(upstream.body, 1_000_000), config.token)
    return new Response(html, { headers: { ...HEADERS, "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" } })
  } catch { return unavailable() }
}
