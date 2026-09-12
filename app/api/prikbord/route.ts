import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import {
  BODY_MAX,
  DEFAULT_NAME,
  NAME_MAX,
  RATE_LIMIT,
  configured,
  countRecent,
  insertMessage,
  listMessages,
} from "@/lib/prikbord"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({ messages: await listMessages(), enabled: configured() })
  } catch (err) {
    console.warn("[prikbord]", err instanceof Error ? err.message : err)
    return NextResponse.json({ messages: [], enabled: false }, { status: 500 })
  }
}

/* control characters out, whitespace runs collapsed, but newlines kept */
const tidy = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max)

function ipHash(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  return createHash("sha256")
    .update(`${ip}${process.env.PRIKBORD_SALT ?? ""}`)
    .digest("hex")
}

export async function POST(req: NextRequest) {
  if (!configured())
    return NextResponse.json({ error: "prikbord is not configured" }, { status: 503 })

  let payload: Record<string, unknown>
  try {
    payload = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 })
  }

  /* honeypot: real people never see this field */
  if (payload.website) return NextResponse.json({ ok: true }, { status: 201 })

  const body = tidy(payload.body, BODY_MAX + 1)
  const name = tidy(payload.name, NAME_MAX + 1).replace(/\n/g, " ") || DEFAULT_NAME
  if (!body) return NextResponse.json({ error: "say something first" }, { status: 400 })
  if (body.length > BODY_MAX)
    return NextResponse.json({ error: `keep it under ${BODY_MAX} characters` }, { status: 400 })
  if (name.length > NAME_MAX)
    return NextResponse.json({ error: `name under ${NAME_MAX} characters` }, { status: 400 })

  const hash = ipHash(req)
  try {
    if ((await countRecent(hash)) >= RATE_LIMIT)
      return NextResponse.json(
        { error: "that's a lot of messages; try again in a bit" },
        { status: 429 },
      )
    const message = await insertMessage({ name, body, ipHash: hash })
    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.warn("[prikbord]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "could not save, try again" }, { status: 500 })
  }
}
