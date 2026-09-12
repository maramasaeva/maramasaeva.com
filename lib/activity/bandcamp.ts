import type { ActivityItem } from "./types"
import { releases } from "@/lib/data"

/* Bandcamp has no public API; the discography is a hand-kept list. */
export async function fetchBandcamp(): Promise<ActivityItem[]> {
  return releases.map((r) => ({
    id: `bandcamp-${r.title}`,
    source: "bandcamp",
    category: "music",
    title: `released "${r.title}" ${r.kind}`,
    timestamp: new Date(r.date).toISOString(),
    url: r.href,
  }))
}
