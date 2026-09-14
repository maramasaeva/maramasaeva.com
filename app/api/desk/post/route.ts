import type { NextRequest } from "next/server"
import { recordSent } from "@/lib/desk/store"
import { publish, xConfigured, type PostKind } from "@/lib/desk/x"
import { guard, json, readJson } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

const KINDS: PostKind[] = ["reply", "quote", "post"]
const HARD_MAX = 4000
/* x rejects api replies and quotes unless the author mentioned you first
   (feb 2026, all tiers below enterprise); the desk hands those to x's own
   composer instead, so this route only ever sends standalone posts */
const API_KINDS: PostKind[] = ["post"]

/* the one route that speaks as mara. it only runs after a click on the desk,
   with the desk cookie, from the desk page, with exactly the text shown in
   the textarea. */
export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (!xConfigured()) return json({ error: "x keys not set" }, 503)
  const body = await readJson<{ kind?: unknown; text?: unknown; target?: unknown }>(req)
  const kind = KINDS.find((k) => k === body?.kind)
  const text = typeof body?.text === "string" ? body.text.replace(/\r\n/g, "\n").trim() : ""
  const target = typeof body?.target === "string" && /^\d{1,25}$/.test(body.target) ? body.target : undefined
  if (!kind) return json({ error: "kind must be reply, quote or post" }, 400)
  if (!API_KINDS.includes(kind)) return json({ error: "x only allows standalone posts through the api; use open in x" }, 400)
  if (!text) return json({ error: "nothing to post" }, 400)
  if (text.length > HARD_MAX) return json({ error: `over ${HARD_MAX} characters` }, 400)
  if (kind !== "post" && !target) return json({ error: "reply and quote need a target" }, 400)
  try {
    const id = await publish(text, kind, target)
    await recordSent({ id, text, kind, target: target ?? null }).catch(() => {})
    return json({ id, url: `https://x.com/rssmrm/status/${id}` }, 201)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "failed" }, 502)
  }
}
