import type { ActivityItem } from "./types"

/* Strava hands out short-lived access tokens; the refresh token in the env
   is exchanged on every sync. Get it once via /api/strava/callback. */
async function accessToken(): Promise<string | null> {
  const id = process.env.STRAVA_CLIENT_ID
  const secret = process.env.STRAVA_CLIENT_SECRET
  const refresh = process.env.STRAVA_REFRESH_TOKEN
  if (!id || !secret || !refresh) return null

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`strava token ${res.status}`)
  return ((await res.json()) as { access_token?: string }).access_token ?? null
}

type StravaActivity = {
  id: number
  type: string
  distance: number
  moving_time: number
  start_date: string
}

const VERB: Record<string, string> = {
  Run: "ran",
  Walk: "walked",
  Hike: "hiked",
  Ride: "cycled",
  Swim: "swam",
}

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`
}

export async function fetchStrava(): Promise<ActivityItem[]> {
  const token = await accessToken()
  if (!token) return []

  const res = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  )
  if (!res.ok) throw new Error(`strava ${res.status}`)
  const list = (await res.json()) as StravaActivity[]

  return list.map((a) => {
    const verb = VERB[a.type]
    const title = verb
      ? `${verb} ${(a.distance / 1000).toFixed(1)}km in ${fmtTime(a.moving_time)}`
      : `${a.type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} for ${Math.round(a.moving_time / 60)}min`
    return {
      id: `strava-${a.id}`,
      source: "strava",
      category: "sports",
      title,
      timestamp: a.start_date,
      url: `https://www.strava.com/activities/${a.id}`,
    }
  })
}
