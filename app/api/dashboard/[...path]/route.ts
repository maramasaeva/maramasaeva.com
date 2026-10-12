import type { NextRequest } from "next/server"
import { isDesk } from "@/lib/desk/auth"
import { allowedEndpoint, allowedQuery, boundedText, gatewayConfig, sameOrigin } from "@/lib/dashboard/proxy"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 120
const HEADERS = { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "application/json; charset=utf-8" }
const error = (message: string, status: number) => Response.json({ error: message }, { status, headers: HEADERS })

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const write = req.method !== "GET"
  if (!sameOrigin(req, write)) return error("Cross-site request blocked.", 403)
  if (!(await isDesk())) return error("Sign in to your dashboard.", 401)
  const { path } = await context.params
  if (!allowedEndpoint(req.method, path)) return error("Dashboard endpoint not found.", 404)
  const name = path.join("/")
  const query = allowedQuery(name, req.nextUrl.searchParams)
  if (!query) return error("Invalid query.", 400)
  const config = gatewayConfig()
  if (!config) return error("The private messaging gateway is not configured.", 503)
  let body: string | undefined
  if (write) {
    if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error("Send JSON.", 415)
    if (name === "v1/send" && req.headers.get("x-reply-queue-approval") !== "manual") return error("Approve this exact message before sending.", 403)
    try {
      body = await boundedText(req.body, 32_768)
      const payload = JSON.parse(body)
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return error("Invalid request.", 400)
    } catch { return error("Invalid or oversized request.", 413) }
  }
  try {
    const upstream = await fetch(`${config.origin}/${name}${query.size ? `?${query}` : ""}`, {
      method: req.method, body, redirect: "error", cache: "no-store",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json", "ngrok-skip-browser-warning": "dashboard", ...(name === "v1/send" ? { "X-Reply-Queue-Approval": "manual" } : {}) },
      signal: AbortSignal.timeout(name === "v1/draft" ? 110_000 : 25_000),
    })
    if (!upstream.headers.get("content-type")?.includes("application/json")) return error("The messaging gateway is unavailable. Check the background host and tunnel.", 502)
    const text = await boundedText(upstream.body, 2_000_000)
    if (text.includes(config.token)) return error("Invalid gateway response.", 502)
    JSON.parse(text)
    // Never relay Set-Cookie, Location, authentication challenges or upstream headers.
    return new Response(text, { status: upstream.status, headers: HEADERS })
  } catch {
    return error(name === "v1/send" ? "Delivery could not be confirmed. Check the conversation before retrying." : "The background messaging host is offline or unavailable.", 502)
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
