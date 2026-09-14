import { NextResponse, type NextRequest } from "next/server"
import { COOKIE, deskConfigured, passphraseOk, sessionCookie } from "@/lib/desk/auth"
import { getMeta, setMeta } from "@/lib/desk/store"
import { json, readJson, sameSite } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

/* a wrong passphrase is counted in desk_meta; after MAX_FAILS the door stays
   shut for LOCK_MS no matter what is typed. the passphrase is four random
   words, so this is belt on top of braces. */
const MAX_FAILS = 8
const LOCK_MS = 60 * 60 * 1000

type Fails = { n: number; since: number }

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return json({ error: "cross-site request" }, 403)
  if (!deskConfigured()) return json({ error: "desk not configured" }, 503)
  const body = await readJson<{ passphrase?: unknown }>(req, 2048)

  const fails: Fails = JSON.parse((await getMeta("login_fails")) ?? '{"n":0,"since":0}')
  const fresh = Date.now() - fails.since < LOCK_MS
  if (fresh && fails.n >= MAX_FAILS) return json({ error: "too many tries, wait an hour" }, 429)

  if (!passphraseOk(body?.passphrase)) {
    await setMeta("login_fails", JSON.stringify({ n: fresh ? fails.n + 1 : 1, since: fresh ? fails.since : Date.now() }))
    await new Promise((r) => setTimeout(r, 800))
    return json({ error: "wrong passphrase" }, 401)
  }

  await setMeta("login_fails", JSON.stringify({ n: 0, since: 0 }))
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  res.cookies.set(sessionCookie())
  return res
}

export async function DELETE(req: NextRequest) {
  if (!sameSite(req)) return json({ error: "cross-site request" }, 403)
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  res.cookies.set({ name: COOKIE, value: "", path: "/", maxAge: 0 })
  return res
}
