import assert from "node:assert/strict"
import { test } from "node:test"
// Node 24 executes this dependency directly using native TypeScript stripping.
// @ts-expect-error TS extension is intentional for the standalone Node test runner.
import { allowedEndpoint, allowedQuery, boundedText, gatewayConfig, sameOrigin, websiteHtml } from "./proxy.ts"

test("fixed HTTPS origin is required; credentials, local targets and paths fail closed", () => {
  const config = (url: string) => gatewayConfig({ DASHBOARD_GATEWAY_URL: url, DASHBOARD_GATEWAY_TOKEN: "x".repeat(32) })
  assert.equal(config("https://gateway.example.com")?.origin, "https://gateway.example.com")
  for (const url of ["http://gateway.example.com", "https://localhost", "https://127.0.0.1", "https://[::1]", "https://user:secret@gateway.example.com", "https://gateway.example.com/app", "https://gateway.example.com?url=bad", "https://gateway.example.com#secret", "https://host.local", "https://host.internal", "https://gateway.example.com:8443"]) assert.equal(config(url), null)
  assert.equal(gatewayConfig({ DASHBOARD_GATEWAY_URL: "https://gateway.example.com", DASHBOARD_GATEWAY_TOKEN: "tiny" }), null)
})

test("only specific messaging endpoints and methods are reachable", () => {
  for (const path of ["v1/health", "v1/drafts", "v1/inbox/whatsapp", "v1/thread/signal", "v1/send/tasks/abc-123"]) assert.equal(allowedEndpoint("GET", path.split("/")), true)
  assert.equal(allowedEndpoint("POST", ["v1", "send"]), true)
  assert.equal(allowedEndpoint("PUT", ["v1", "drafts"]), true)
  for (const [method, path] of [["GET", "setup/drafts"], ["GET", "v1/extension/whatsapp/tasks"], ["POST", "v1/thread/whatsapp"], ["POST", "v1/connectors/whatsapp/link"], ["GET", "v1/send"], ["DELETE", "v1/drafts"], ["GET", "v1/thread/../../setup"], ["GET", "v1/thread/whatsapp%2fsetup"]]) assert.equal(allowedEndpoint(method, path.split("/")), false)
})

test("queries cannot introduce arbitrary URLs or duplicate parameters", () => {
  assert.equal(allowedQuery("v1/thread/whatsapp", new URLSearchParams("chat=a&limit=60&before=123"))?.get("chat"), "a")
  for (const query of ["url=https://evil.example", "chat=a&chat=b", "limit=-1", "before=Infinity"]) assert.equal(allowedQuery("v1/thread/whatsapp", new URLSearchParams(query)), null)
  assert.equal(allowedQuery("v1/health", new URLSearchParams("chat=a")), null)
})

test("writes need exact same-origin; same-site sibling origins are blocked", () => {
  const req = (origin?: string, site?: string) => new Request("https://maramasaeva.com/api/dashboard/v1/send", { headers: { ...(origin ? { origin } : {}), ...(site ? { "sec-fetch-site": site } : {}) } })
  assert.equal(sameOrigin(req("https://maramasaeva.com", "same-origin"), true), true)
  assert.equal(sameOrigin(req(), true), false)
  assert.equal(sameOrigin(req("https://evil.example"), true), false)
  assert.equal(sameOrigin(req("https://sub.maramasaeva.com", "same-site"), true), false)
  assert.equal(sameOrigin(req(undefined, "cross-site")), false)
})

test("request and response bodies are bounded by bytes, not string length", async () => {
  assert.equal(await boundedText(new Response("hello").body, 5), "hello")
  await assert.rejects(() => boundedText(new Response("hello").body, 4))
  await assert.rejects(() => boundedText(new Response("éé").body, 3))
})

test("shell injects only same-origin empty-token config and rejects leaked credentials", () => {
  const safe = websiteHtml("<!doctype html><head></head><body><script>const local=window.REPLY_QUEUE_LOCAL;</script></body>", "secret")
  assert.match(safe, /gateway:"\/api\/dashboard",token:"",mode:"website"/)
  assert.match(safe, /website-logout/)
  assert.throws(() => websiteHtml("<head></head><body>secret</body>", "secret"))
  assert.throws(() => websiteHtml("<head><script>window.REPLY_QUEUE_LOCAL={token:'bad'};</script></head>", "secret"))
})
