import type { NextRequest } from "next/server"
import { REFRESH_GAP_MS, SHOW_DAYS, WATCHED } from "@/lib/desk/config"
import { getMeta, listItems, listSent, newestIds, setMeta, upsertItems } from "@/lib/desk/store"
import { fetchNew, xConfigured } from "@/lib/desk/x"
import { guard, json } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

async function snapshot() {
  const since = new Date(Date.now() - SHOW_DAYS * 86_400_000).toISOString()
  const [items, sent, last] = await Promise.all([listItems(since), listSent(), getMeta("last_refresh")])
  return { items, sent, lastRefresh: last, watched: WATCHED.map((w) => w.handle) }
}

/** what is on the desk */
export async function GET(req: NextRequest) {
  const denied = await guard(req, { needBody: false })
  if (denied) return denied
  try {
    return json(await snapshot())
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "failed" }, 500)
  }
}

/** pull new posts from x. each fetched post is billed, hence the gap and the
    per-account cap; a refresh inside the gap just returns the snapshot. */
export async function POST(req: NextRequest) {
  const denied = await guard(req, { needBody: false })
  if (denied) return denied
  if (!xConfigured()) return json({ error: "x keys not set" }, 503)
  try {
    const last = await getMeta("last_refresh")
    const tooSoon = last && Date.now() - new Date(last).getTime() < REFRESH_GAP_MS
    let fetched = 0
    const errors: string[] = []
    if (!tooSoon) {
      const newest = await newestIds()
      const results = await Promise.allSettled(WATCHED.map((w) => fetchNew(w, newest[w.handle.toLowerCase()])))
      const rows = results.flatMap((r, i) => {
        if (r.status === "fulfilled") return r.value
        errors.push(`${WATCHED[i].handle}: ${r.reason instanceof Error ? r.reason.message : "failed"}`)
        return []
      })
      await upsertItems(rows)
      fetched = rows.length
      await setMeta("last_refresh", new Date().toISOString())
    }
    return json({ ...(await snapshot()), fetched, tooSoon: !!tooSoon, errors })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "failed" }, 500)
  }
}
