import { createHmac, randomBytes } from "node:crypto"
import { LOOKBACK_MS, PER_ACCOUNT, WATCHED, type Watched } from "./config"
import type { Item } from "./store"

/* The x api v2. Reads use the app bearer token; posting uses oauth 1.0a
   user-context keys for @rssmrm, signed here by hand so the site keeps its
   zero runtime dependencies. */

const API = "https://api.x.com/2"

function env(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`${name} not set`)
  return v
}

export const xConfigured = () =>
  ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET", "X_BEARER_TOKEN"].every(
    (k) => !!process.env[k],
  )

const enc = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

/** oauth 1.0a authorization header for a request with a json body (body is not signed) */
function oauth1(method: string, url: string) {
  const p: Record<string, string> = {
    oauth_consumer_key: env("X_API_KEY"),
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: env("X_ACCESS_TOKEN"),
    oauth_version: "1.0",
  }
  const u = new URL(url)
  const all: Record<string, string> = { ...p }
  u.searchParams.forEach((v, k) => (all[k] = v))
  const params = Object.keys(all)
    .sort()
    .map((k) => `${enc(k)}=${enc(all[k])}`)
    .join("&")
  const base = [method.toUpperCase(), enc(u.origin + u.pathname), enc(params)].join("&")
  const key = `${enc(env("X_API_SECRET"))}&${enc(env("X_ACCESS_SECRET"))}`
  p.oauth_signature = createHmac("sha1", key).update(base).digest("base64")
  return `OAuth ${Object.keys(p)
    .sort()
    .map((k) => `${enc(k)}="${enc(p[k])}"`)
    .join(", ")}`
}

type RawTweet = {
  id: string
  text: string
  created_at: string
  note_tweet?: { text: string }
  public_metrics?: { like_count: number; reply_count: number; retweet_count: number; quote_count: number; impression_count?: number }
}

/** new original posts by one account since `sinceId` (or the last LOOKBACK_MS) */
export async function fetchNew(w: Watched, sinceId?: string): Promise<Omit<Item, "hidden">[]> {
  const q = new URLSearchParams({
    max_results: String(Math.max(5, PER_ACCOUNT)),
    exclude: "retweets,replies",
    "tweet.fields": "created_at,public_metrics,note_tweet",
  })
  if (sinceId) q.set("since_id", sinceId)
  else q.set("start_time", new Date(Date.now() - LOOKBACK_MS).toISOString())
  const res = await fetch(`${API}/users/${w.id}/tweets?${q}`, {
    headers: { authorization: `Bearer ${env("X_BEARER_TOKEN")}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`x timeline ${w.handle} ${res.status} ${(await res.text()).slice(0, 200)}`)
  const body = (await res.json()) as { data?: RawTweet[] }
  return (body.data ?? []).slice(0, PER_ACCOUNT).map((t) => ({
    id: t.id,
    author: w.handle.toLowerCase(),
    author_name: w.name,
    text: (t.note_tweet?.text ?? t.text).replace(/\s*https:\/\/t\.co\/\S+$/g, "").trim(),
    created_at: t.created_at,
    metrics: t.public_metrics
      ? {
          likes: t.public_metrics.like_count,
          replies: t.public_metrics.reply_count,
          reposts: t.public_metrics.retweet_count + t.public_metrics.quote_count,
          views: t.public_metrics.impression_count,
        }
      : null,
  }))
}

export type PostKind = "reply" | "quote" | "post"

/** publish as @rssmrm; returns the new tweet id */
export async function publish(text: string, kind: PostKind, target?: string): Promise<string> {
  const url = `${API}/tweets`
  const body: Record<string, unknown> = { text }
  if (kind === "reply" && target) body.reply = { in_reply_to_tweet_id: target }
  if (kind === "quote" && target) body.quote_tweet_id = target
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: oauth1("POST", url), "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const json = (await res.json().catch(() => ({}))) as { data?: { id: string }; detail?: string; title?: string }
  if (!res.ok || !json.data?.id) throw new Error(`x post ${res.status} ${json.detail ?? json.title ?? ""}`.trim())
  return json.data.id
}

export const watchedByHandle = (handle: string) =>
  WATCHED.find((w) => w.handle.toLowerCase() === handle.toLowerCase())
