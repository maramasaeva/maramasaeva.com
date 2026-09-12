import type { ActivityItem } from "./types"
import { REVALIDATE, UA } from "./types"

const FEED = "https://messinecessity.substack.com/feed"

const pick = (xml: string, tag: string) =>
  xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1] ??
  xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ??
  ""

export async function fetchSubstack(): Promise<ActivityItem[]> {
  const res = await fetch(FEED, {
    headers: { "User-Agent": UA },
    next: { revalidate: REVALIDATE },
  })
  if (!res.ok) throw new Error(`substack ${res.status}`)
  const xml = await res.text()

  const items: ActivityItem[] = []
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = pick(m[1], "title").trim()
    const link = pick(m[1], "link").trim()
    const date = new Date(pick(m[1], "pubDate"))
    if (!title || isNaN(date.getTime())) continue
    items.push({
      id: `substack-${link}`,
      source: "substack",
      category: "writing",
      title: `published "${title.toLowerCase()}"`,
      timestamp: date.toISOString(),
      url: link,
    })
  }
  return items
}
