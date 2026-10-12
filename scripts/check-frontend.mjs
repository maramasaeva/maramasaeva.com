import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
const origin = process.argv[2] || "http://localhost:3001"
for (const route of ["/", "/work", "/creative", "/services", "/services/swarmchasing", "/writing", "/writing/think", "/questions", "/messageboard", "/observatory"]) {
  const response = await fetch(origin + route)
  assert.equal(response.status, 200, route)
  console.log(route + " · 200")
}
const home = await (await fetch(origin + "/")).text()
const articles = home.match(/<article[^>]*class="project-card"[^>]*>[\s\S]*?<\/article>/g) || []
assert.ok(articles.length >= 30, "the complete catalogue is rendered")
const files = new Set()
for (const article of articles) {
  assert.match(article, /<(?:img|video)\b/, "every project has imagery")
  for (const match of article.matchAll(/(?:src|poster)="([^"]+)"/g)) {
    let src = match[1].replaceAll("&amp;", "&")
    if (src.startsWith("/_next/image")) src = new URL(src, origin).searchParams.get("url") || ""
    if (!src.startsWith("/portfolio/") && !src.startsWith("/observatory/fig/")) continue
    assert.ok(fs.existsSync(path.join(process.cwd(), "public", src)), "missing asset: " + src)
    files.add(src)
  }
}
for (const file of files) assert.equal((await fetch(origin + file)).status, 200, file)
console.log(articles.length + " projects · all have local image/video assets")
const privatePage = await fetch(origin + "/desk/app", { redirect: "manual" })
assert.ok([303,307].includes(privatePage.status))
assert.equal(new URL(privatePage.headers.get("location"),origin).pathname,"/desk")
assert.match(privatePage.headers.get("cache-control") || "", /no-store/)
const api = await fetch(origin + "/api/dashboard/v1/health")
assert.equal(api.status,401)
assert.match(api.headers.get("cache-control") || "",/no-store/)
const crossSite = await fetch(origin + "/api/dashboard/v1/drafts", {method:"PUT",headers:{"Origin":"https://other.example","Content-Type":"application/json"},body:JSON.stringify({key:"test:unauthorised",text:""})})
assert.equal(crossSite.status,403)
const sameSite = await fetch(origin + "/api/dashboard/v1/drafts",{method:"PUT",headers:{"Origin":origin,"Content-Type":"application/json"},body:JSON.stringify({key:"test:unauthorised",text:""})})
assert.equal(sameSite.status,401)
console.log("private desk redirects · API rejects unauthenticated and cross-origin requests")
