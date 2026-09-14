/* Desk storage in supabase: fetched posts, sent posts, and a small meta
   table. Same pattern as lib/prikbord.ts: rest endpoint, service role key,
   server only, RLS on with no policies. */

export type Item = {
  id: string
  author: string
  author_name: string | null
  text: string
  created_at: string
  metrics: { likes: number; replies: number; reposts: number; views?: number } | null
  hidden: boolean
}

export type Sent = { id: string; text: string; kind: string; target: string | null; created_at: string }

function config(table: string) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("supabase not configured")
  return {
    base: `${url.replace(/\/$/, "")}/rest/v1/${table}`,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  }
}

async function rest<T>(table: string, query: Record<string, string>, init: RequestInit = {}): Promise<T> {
  const c = config(table)
  const q = new URLSearchParams(query)
  const res = await fetch(`${c.base}${q.size ? `?${q}` : ""}`, {
    ...init,
    headers: { ...c.headers, ...(init.headers ?? {}) },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`${table} ${init.method ?? "GET"} ${res.status} ${(await res.text()).slice(0, 200)}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export async function listItems(sinceIso: string): Promise<Item[]> {
  return rest<Item[]>("desk_items", {
    select: "id,author,author_name,text,created_at,metrics,hidden",
    hidden: "eq.false",
    created_at: `gte.${sinceIso}`,
    order: "created_at.desc",
    limit: "200",
  })
}

/** newest stored tweet id per author, so refreshes only pay for new posts */
export async function newestIds(): Promise<Record<string, string>> {
  const rows = await rest<{ author: string; id: string }[]>("desk_items", {
    select: "author,id",
    order: "author.asc,created_at.desc",
  })
  const out: Record<string, string> = {}
  for (const r of rows) if (!(r.author in out)) out[r.author] = r.id
  return out
}

export async function upsertItems(items: Omit<Item, "hidden">[]) {
  if (!items.length) return
  await rest("desk_items", { on_conflict: "id" }, {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(items),
  })
}

export async function hideItem(id: string) {
  await rest("desk_items", { id: `eq.${id}` }, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ hidden: true }),
  })
}

export async function getItem(id: string): Promise<Item | null> {
  const rows = await rest<Item[]>("desk_items", {
    select: "id,author,author_name,text,created_at,metrics,hidden",
    id: `eq.${id}`,
    limit: "1",
  })
  return rows[0] ?? null
}

export async function recordSent(row: Omit<Sent, "created_at">) {
  await rest("desk_posts", {}, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  })
}

export async function listSent(limit = 20): Promise<Sent[]> {
  return rest<Sent[]>("desk_posts", { select: "*", order: "created_at.desc", limit: String(limit) })
}

export async function getMeta(key: string): Promise<string | null> {
  const rows = await rest<{ value: string }[]>("desk_meta", { select: "value", key: `eq.${key}`, limit: "1" })
  return rows[0]?.value ?? null
}

export async function setMeta(key: string, value: string) {
  await rest("desk_meta", { on_conflict: "key" }, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  })
}
