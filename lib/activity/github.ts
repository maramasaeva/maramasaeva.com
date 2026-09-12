import type { ActivityItem, Category } from "./types"
import { REVALIDATE, UA } from "./types"

const USER = "maramasaeva"
/** repo-days that get their commit messages fetched (one api call each) */
const DETAIL_DAYS = 12
const MAX_MESSAGES = 4

/** Repos that are not "code" in the sense the panel means. */
const SKIP = new Set(["obsidian", "activity-mirror"])
const CATEGORY_BY_REPO: Record<string, Category> = {
  "messier-live": "music",
  "messier-subtitle-tool": "music",
}
const categoryFor = (repo: string): Category =>
  CATEGORY_BY_REPO[repo] ?? (repo.startsWith("kaios") ? "music" : "code")

type GhEvent = {
  type: string
  created_at?: string
  repo?: { name?: string }
  payload?: { commits?: { message: string }[]; ref_type?: string }
}
type GhCommit = { commit: { message: string; author?: { name?: string } } }

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": UA,
  }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

/** first lines of that day's commits, deduped, merge noise dropped */
async function commitLines(repo: string, day: string): Promise<string[]> {
  const q = new URLSearchParams({
    since: `${day}T00:00:00Z`,
    until: `${day}T23:59:59Z`,
    per_page: "30",
  })
  const res = await fetch(`https://api.github.com/repos/${USER}/${repo}/commits?${q}`, {
    headers: headers(),
    next: { revalidate: REVALIDATE },
  })
  if (!res.ok) return []
  const commits = (await res.json()) as GhCommit[]
  const seen = new Set<string>()
  const lines: string[] = []
  for (const c of commits) {
    const line = c.commit.message.split("\n")[0].replace(/\s*\(#\d+\)\s*$/, "").trim()
    if (!line || /^merge (branch|pull request)/i.test(line) || seen.has(line.toLowerCase())) continue
    seen.add(line.toLowerCase())
    lines.push(line.charAt(0).toLowerCase() + line.slice(1))
  }
  return lines
}

export async function fetchGitHub(): Promise<ActivityItem[]> {
  const res = await fetch(
    `https://api.github.com/users/${USER}/events/public?per_page=100`,
    { headers: headers(), next: { revalidate: REVALIDATE } },
  )
  if (!res.ok) throw new Error(`github ${res.status}`)
  const events = (await res.json()) as GhEvent[]

  /* one row per repo per day, otherwise every push is a line */
  const days = new Map<
    string,
    { repo: string; day: string; types: Set<string>; timestamp: string }
  >()
  for (const ev of events) {
    const repo = ev.repo?.name?.split("/")[1]
    const day = ev.created_at?.slice(0, 10)
    if (!repo || !day || SKIP.has(repo)) continue
    const key = `${repo}-${day}`
    const cur = days.get(key)
    if (cur) cur.types.add(ev.type)
    else days.set(key, { repo, day, types: new Set([ev.type]), timestamp: ev.created_at! })
  }

  const rows = [...days].sort((a, b) => b[1].timestamp.localeCompare(a[1].timestamp))
  const details = await Promise.all(
    rows.map(([, r], i) =>
      i < DETAIL_DAYS ? commitLines(r.repo, r.day) : Promise.resolve([]),
    ),
  )

  return rows.map(([key, { repo, types, timestamp }], i) => {
    let verb = "worked on"
    if (types.has("CreateEvent") && types.size === 1) verb = "created"
    else if (types.has("ReleaseEvent")) verb = "released"
    else if (types.has("PublicEvent")) verb = "opened up"
    const lines = details[i]
    const extra = lines.length - MAX_MESSAGES
    return {
      id: `github-${key}`,
      source: "github",
      category: categoryFor(repo),
      title: `${verb} ${repo}`,
      timestamp,
      url: `https://github.com/${USER}/${repo}`,
      body: lines.length
        ? lines.slice(0, MAX_MESSAGES).join("\n") + (extra > 0 ? `\n+${extra} more` : "")
        : undefined,
    }
  })
}
