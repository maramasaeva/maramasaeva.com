/* One row in the recent-activity panel. Every fetcher in this directory
   returns a list of these; the aggregator sorts and caps them. */

export type Source =
  | "github"
  | "strava"
  | "substack"
  | "bandcamp"
  | "calendar"
  | "x"

export type Category =
  | "code"
  | "music"
  | "sports"
  | "events"
  | "writing"
  | "tweets"

export type ActivityItem = {
  id: string
  source: Source
  category: Category
  /** short verb phrase, lowercase: "worked on evals", "ran 8.2km in 41:10" */
  title: string
  /** ISO 8601 */
  timestamp: string
  url?: string
  /** longer text shown under the title; used for tweets */
  body?: string
  /** events that have not ended yet are rendered with a tag and sort first */
  upcoming?: boolean
  /** events happening today (in the calendar's timezone) */
  today?: boolean
  /** YYYY-MM-DD to show instead of the timestamp's UTC day (events, so a 7pm
      pacific event does not read as the next day) */
  day?: string
  /** tweets: attached images, shown on request */
  images?: string[]
  /** tweets: the quoted post, if any */
  quote?: { name: string; handle: string; text: string }
}

export type SourceStatus = "ok" | "error" | "disabled"

export type ActivityResponse = {
  items: ActivityItem[]
  sources: Record<Source, SourceStatus>
  counts: Record<Category, number>
  lastSync: string
}

/** filter order in the panel; the first one with items is the default view */
export const CATEGORIES: Category[] = [
  "tweets",
  "code",
  "music",
  "events",
  "writing",
  "sports",
]

/** Shared fetch options: an hour of server-side caching, and a UA so the
    upstreams can see who is asking. */
export const REVALIDATE = 3600
export const UA = "maramasaeva.com (activity panel)"
