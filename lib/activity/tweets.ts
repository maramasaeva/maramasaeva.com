import type { ActivityItem } from "./types"
import { tweets } from "@/lib/data"

/* X has no free read API and its old syndication endpoint returns a stale,
   partial timeline, so tweets are hand-kept in lib/data.ts: paste the url
   and the text, newest first. Shown as text, never embedded. */

const HANDLE = "rssmrm"

/** the embed data x hands out cuts long posts short; mark that honestly */
const ellipsis = (s: string) =>
  s.length >= 270 && !/[.!?…"”)]$/.test(s.trim()) ? `${s.trim()}…` : s

export async function fetchTweets(): Promise<ActivityItem[]> {
  return tweets.map((t) => ({
    id: `x-${t.id}`,
    source: "x",
    category: "tweets",
    title: "posted",
    body: ellipsis(t.text),
    timestamp: new Date(t.date).toISOString(),
    url: `https://x.com/${HANDLE}/status/${t.id}`,
    images: t.images,
    quote: t.quote,
  }))
}
