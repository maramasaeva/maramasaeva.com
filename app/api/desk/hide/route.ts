import type { NextRequest } from "next/server"
import { hideItem } from "@/lib/desk/store"
import { guard, json, readJson } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

/** take a tweet off the desk (on every device; it stays in the table) */
export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = await readJson<{ id?: unknown }>(req, 1024)
  if (typeof body?.id !== "string" || !/^\d{1,25}$/.test(body.id)) return json({ error: "bad id" }, 400)
  try {
    await hideItem(body.id)
    return json({ ok: true })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "failed" }, 500)
  }
}
