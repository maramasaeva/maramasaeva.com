import { NextResponse, type NextRequest } from "next/server"

/* One-time helper. Visit
   https://www.strava.com/oauth/authorize?client_id=ID&redirect_uri=SITE/api/strava/callback&response_type=code&scope=activity:read_all
   and this page prints the refresh token to store as STRAVA_REFRESH_TOKEN. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const id = process.env.STRAVA_CLIENT_ID
  const secret = process.env.STRAVA_CLIENT_SECRET
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 })
  if (!id || !secret)
    return NextResponse.json({ error: "strava not configured" }, { status: 500 })

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })
  const data = (await res.json()) as {
    refresh_token?: string
    athlete?: { firstname?: string }
  }
  if (!res.ok)
    return NextResponse.json({ error: "token exchange failed", detail: data }, { status: 502 })

  const html = `<!doctype html><meta charset="utf-8"><title>strava connected</title>
<body style="font:15px/1.5 ui-monospace,Menlo,monospace;background:#fdfcfb;color:#171716;padding:3rem;max-width:40rem">
<p>strava connected${data.athlete?.firstname ? ` for ${data.athlete.firstname}` : ""}.</p>
<p>store this as <b>STRAVA_REFRESH_TOKEN</b> in vercel, then close the tab:</p>
<pre style="padding:1rem;border:1px solid #e2e0da;overflow:auto">${data.refresh_token ?? "(no refresh token in response)"}</pre>
</body>`
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
