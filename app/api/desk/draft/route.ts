import type { NextRequest } from "next/server"
import { draftConfigured, makeDrafts } from "@/lib/desk/draft"
import { getItem } from "@/lib/desk/store"
import type { PostKind } from "@/lib/desk/x"
import { guard, json, readJson } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

const KINDS: PostKind[] = ["reply", "quote", "post"]

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (!draftConfigured()) return json({ error: "no draft provider (ANTHROPIC_API_KEY or OPENAI_API_KEY)" }, 503)
  const body = await readJson<{ kind?: unknown; itemId?: unknown; hint?: unknown }>(req)
  const kind = KINDS.find((k) => k === body?.kind)
  if (!kind) return json({ error: "kind must be reply, quote or post" }, 400)
  const hint = typeof body?.hint === "string" ? body.hint.slice(0, 2000) : ""
  try {
    const item = kind === "post" ? null : typeof body?.itemId === "string" ? await getItem(body.itemId) : null
    if (kind !== "post" && !item) return json({ error: "unknown tweet" }, 404)
    return json({ drafts: await makeDrafts(kind, item, hint) })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "failed" }, 500)
  }
}
