import type {
  ActivityItem,
  ActivityResponse,
  Category,
  Source,
  SourceStatus,
} from "./types"
import { CATEGORIES } from "./types"
import { fetchGitHub } from "./github"
import { fetchStrava } from "./strava"
import { fetchSubstack } from "./substack"
import { fetchBandcamp } from "./bandcamp"
import { fetchEvents } from "./events"
import { fetchTweets } from "./tweets"

const MAX_ITEMS = 60

const fetchers: { name: Source; fn: () => Promise<ActivityItem[]> }[] = [
  { name: "github", fn: fetchGitHub },
  { name: "strava", fn: fetchStrava },
  { name: "substack", fn: fetchSubstack },
  { name: "bandcamp", fn: fetchBandcamp },
  { name: "calendar", fn: fetchEvents },
  { name: "x", fn: fetchTweets },
]

/** Every source runs; one failing never hides the others. */
export async function aggregateActivity(): Promise<ActivityResponse> {
  const results = await Promise.allSettled(fetchers.map((f) => f.fn()))

  const items: ActivityItem[] = []
  const sources = {} as Record<Source, SourceStatus>

  results.forEach((r, i) => {
    const name = fetchers[i].name
    if (r.status === "rejected") {
      console.warn("[activity]", name, r.reason instanceof Error ? r.reason.message : r.reason)
      sources[name] = "error"
      return
    }
    sources[name] = r.value.length ? "ok" : "disabled"
    items.push(...r.value)
  })

  /* upcoming events float to the top; everything else newest first */
  items.sort((a, b) => {
    if (!!a.upcoming !== !!b.upcoming) return a.upcoming ? -1 : 1
    if (a.upcoming && b.upcoming) return a.timestamp.localeCompare(b.timestamp)
    return b.timestamp.localeCompare(a.timestamp)
  })
  const kept = items.slice(0, MAX_ITEMS)

  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>
  for (const it of kept) counts[it.category]++

  return { items: kept, sources, counts, lastSync: new Date().toISOString() }
}

export type { ActivityItem, ActivityResponse, Category, Source } from "./types"
