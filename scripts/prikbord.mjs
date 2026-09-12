#!/usr/bin/env node
/* Moderation for the homepage prikbord, from the terminal.
     node scripts/prikbord.mjs list [--all]     newest 50 (--all includes hidden)
     node scripts/prikbord.mjs hide <id...>     take a message off the board
     node scripts/prikbord.mjs unhide <id...>
     node scripts/prikbord.mjs delete <id...>   remove for good
   Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local or the env. */
import { readFileSync } from "node:fs"

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"#]*?)"?\s*(#.*)?$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch {}
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed (in .env.local)")
  process.exit(1)
}
const base = `${url.replace(/\/$/, "")}/rest/v1/prikbord`
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
}

const [cmd = "list", ...args] = process.argv.slice(2)

async function call(method, query, body) {
  const res = await fetch(`${base}?${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${res.status}: ${await res.text()}`)
  return res.json()
}

const ids = args.filter((a) => !a.startsWith("--")).flatMap((a) => a.split(/[\s,]+/)).filter(Boolean)
const byIds = () => `id=in.(${ids.join(",")})`

switch (cmd) {
  case "list": {
    const q = new URLSearchParams({ order: "created_at.desc", limit: "50" })
    if (!args.includes("--all")) q.set("hidden", "eq.false")
    const rows = await call("GET", q)
    for (const r of rows)
      console.log(
        `${r.id}  ${r.created_at.slice(0, 16).replace("T", " ")}  ${r.hidden ? "[hidden] " : ""}${r.name}: ${r.body.replace(/\n/g, " ⏎ ")}`,
      )
    if (!rows.length) console.log("(empty)")
    break
  }
  case "hide":
  case "unhide": {
    if (!ids.length) throw new Error("give at least one id")
    const rows = await call("PATCH", byIds(), { hidden: cmd === "hide" })
    console.log(`${cmd}: ${rows.length} message(s)`)
    break
  }
  case "delete": {
    if (!ids.length) throw new Error("give at least one id")
    const rows = await call("DELETE", byIds())
    console.log(`deleted ${rows.length} message(s)`)
    break
  }
  default:
    console.error(`unknown command ${cmd}`)
    process.exit(1)
}
