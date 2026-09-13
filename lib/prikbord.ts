/* The message board. Talks to supabase over its rest endpoint with the
   service role key, from the server only; the table has row level security
   on and no policies, so nothing reaches it except through these functions. */

export type Message = {
  id: string
  name: string
  body: string
  created_at: string
}

export const NAME_MAX = 32
export const BODY_MAX = 280
export const DEFAULT_NAME = "anoniem"
export const LIST_LIMIT = 50

/** posts allowed per ip per window */
export const RATE_LIMIT = 3
export const RATE_WINDOW_MS = 10 * 60 * 1000
/** posts allowed on the whole board per window, against distributed floods */
export const GLOBAL_LIMIT = 40
export const GLOBAL_WINDOW_MS = 60 * 60 * 1000

function config() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return {
    base: `${url.replace(/\/$/, "")}/rest/v1/prikbord`,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  }
}

export const configured = () => config() !== null

export async function listMessages(): Promise<Message[]> {
  const c = config()
  if (!c) return []
  const q = new URLSearchParams({
    select: "id,name,body,created_at",
    hidden: "eq.false",
    order: "created_at.desc",
    limit: String(LIST_LIMIT),
  })
  const res = await fetch(`${c.base}?${q}`, { headers: c.headers, cache: "no-store" })
  if (!res.ok) throw new Error(`prikbord list ${res.status}`)
  return (await res.json()) as Message[]
}

/** rows in the last `windowMs`, for one ip hash or (no hash) the whole board */
export async function countRecent(ipHash: string | null, windowMs: number): Promise<number> {
  const c = config()
  if (!c) return 0
  const since = new Date(Date.now() - windowMs).toISOString()
  const q = new URLSearchParams({ select: "id", created_at: `gte.${since}` })
  if (ipHash) q.set("ip_hash", `eq.${ipHash}`)
  const res = await fetch(`${c.base}?${q}`, {
    headers: { ...c.headers, Prefer: "count=exact", "Range-Unit": "items", Range: "0-0" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`prikbord count ${res.status}`)
  /* content-range: 0-0/N */
  const total = res.headers.get("content-range")?.split("/")[1]
  return total && total !== "*" ? Number(total) : 0
}

export async function insertMessage(input: {
  name: string
  body: string
  ipHash: string
}): Promise<Message> {
  const c = config()
  if (!c) throw new Error("prikbord not configured")
  const res = await fetch(c.base, {
    method: "POST",
    headers: { ...c.headers, Prefer: "return=representation" },
    body: JSON.stringify({ name: input.name, body: input.body, ip_hash: input.ipHash }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`prikbord insert ${res.status}`)
  const [row] = (await res.json()) as Message[]
  return { id: row.id, name: row.name, body: row.body, created_at: row.created_at }
}
