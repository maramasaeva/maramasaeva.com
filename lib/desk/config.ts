/* The desk (/desk): mara's private reply desk. Which accounts it watches.
   Ids are looked up once (a lookup is a billed read) and kept here; to add an
   account, `curl -H "authorization: Bearer $X_BEARER_TOKEN"
   https://api.x.com/2/users/by/username/<handle>` and paste the id. */

export type Watched = { handle: string; id: string; name: string }

export const WATCHED: Watched[] = [
  { handle: "MTSlive", id: "2029271146445848578", name: "monitoring the situation" },
  { handle: "RatOrthodox", id: "1360367297500741642", name: "brangus" },
  { handle: "JeffLadish", id: "1256004180", name: "jeffrey ladish" },
  { handle: "LeoMcKeeReid", id: "1688775987683803137", name: "leo mckee-reid" },
  { handle: "So8res", id: "245375936", name: "nate soares" },
  { handle: "redwood_ai", id: "1869137469024948224", name: "redwood research" },
  { handle: "ESYudkowsky", id: "2595244026", name: "eliezer yudkowsky" },
  { handle: "AISafetyMemes", id: "1315709346689568770", name: "ai notkilleveryoneism memes" },
  { handle: "METR_Evals", id: "1706770561903497216", name: "metr" },
  { handle: "robbensinger", id: "17479925", name: "rob bensinger" },
  { handle: "ajeya_cotra", id: "917512572965761024", name: "ajeya cotra" },
]

/* mara's own account, for the record */
export const ME = { handle: "rssmrm", id: "1079788490240544770" }

/* reads are billed per post, so: at most this many new posts per account per
   refresh, nothing older than this, and refreshes at least this far apart */
export const PER_ACCOUNT = 15
export const LOOKBACK_MS = 36 * 60 * 60 * 1000
export const REFRESH_GAP_MS = 5 * 60 * 1000
/* what the list shows */
export const SHOW_DAYS = 3

/* posting: mara has premium, so the hard limit is long; 280 is still where a
   post stops being read as a tweet, and a link costs about 13x as much */
export const SOFT_MAX = 280
