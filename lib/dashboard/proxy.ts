/** Server-side only. A fixed, administrator-configured origin, never a user URL. */
export function gatewayConfig(env: Record<string, string | undefined> = process.env) {
  const raw = env.DASHBOARD_GATEWAY_URL
  const token = env.DASHBOARD_GATEWAY_TOKEN
  if (!raw || !token || token.length < 24 || /[\r\n]/.test(token)) return null
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      !["", "/"].includes(url.pathname) || (url.port && url.port !== "443") ||
      host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
      host.endsWith(".internal") || host.includes(":") || /^\d+(\.\d+)*$/.test(host) || !host.includes(".")) return null
    return { origin: url.origin, token }
  } catch { return null }
}

const CHANNELS = "(?:whatsapp|signal|imessage|gmail|x)"
const READ = [
  /^v1\/health$/, /^v1\/drafts$/, new RegExp(`^v1/inbox/${CHANNELS}$`),
  new RegExp(`^v1/thread/${CHANNELS}$`), /^v1\/send\/tasks\/[a-zA-Z0-9-]{1,128}$/,
]

export function allowedEndpoint(method: string, parts: string[]) {
  // No encoded separators, relative traversal or extra upstream routes.
  if (!parts.length || parts.some(p => !p || /[^a-zA-Z0-9-]/.test(p))) return false
  const path = parts.join("/")
  if (method === "GET") return READ.some(pattern => pattern.test(path))
  if (method === "PUT") return path === "v1/drafts"
  if (method === "POST") return path === "v1/draft" || path === "v1/send"
  return false
}

export function allowedQuery(path: string, input: URLSearchParams) {
  const output = new URLSearchParams()
  const allowed = path.startsWith("v1/thread/") ? new Set(["chat", "threadId", "limit", "before"]) : new Set<string>()
  for (const [key, value] of input) {
    if (!allowed.has(key) || output.has(key) || value.length > 1000) return null
    if ((key === "limit" || key === "before") && !/^\d{1,16}$/.test(value)) return null
    output.set(key, value)
  }
  return output
}

export function sameOrigin(req: Request, requireOrigin = false) {
  const site = req.headers.get("sec-fetch-site")
  if (site && site !== "same-origin" && site !== "none") return false
  const origin = req.headers.get("origin")
  if (!origin) return !requireOrigin
  try { return new URL(origin).origin === new URL(req.url).origin } catch { return false }
}

export async function boundedText(stream: ReadableStream<Uint8Array> | null, max: number) {
  if (!stream) return ""
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > max) { await reader.cancel(); throw new Error("body too large") }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const result = new Uint8Array(size)
  let position = 0
  for (const chunk of chunks) { result.set(chunk, position); position += chunk.byteLength }
  return new TextDecoder("utf-8", { fatal: true }).decode(result)
}

export function websiteHtml(html: string, secret: string) {
  if (/window\.REPLY_QUEUE_LOCAL\s*=/.test(html) || !/<\/head>/i.test(html)) throw new Error("unsupported app shell")
  const config = '<script>window.REPLY_QUEUE_LOCAL={gateway:"/api/dashboard",token:"",mode:"website"};</script>'
  const safe = html.replace(/<link\b[^>]*href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*>/gi, "").replace(/<\/head>/i, `${config}</head>`)
  if (safe.includes(secret)) throw new Error("unsafe app shell")
  return safe.replace(/<\/body>/i, '<div style="position:fixed;bottom:10px;right:14px;z-index:100;font:13px system-ui"><a href="/desk/x" style="color:inherit;margin-right:12px">X public replies</a><button type="button" id="website-logout" style="background:#fff;border:1px solid #ccc;border-radius:8px;padding:8px;cursor:pointer">Sign out</button></div><script>document.getElementById("website-logout").onclick=async()=>{const r=await fetch("/api/desk/login",{method:"DELETE"});if(r.ok)location.replace("/desk");};</script></body>')
}
