#!/usr/bin/env bash
# One-time setup for the prikbord on a supabase project you own.
#   scripts/prikbord-setup.sh <project-ref>
# 1. writes SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / PRIKBORD_SALT into .env.local (keys never printed)
# 2. prints the sql to paste once into the dashboard sql editor (supabase/prikbord.sql)
set -euo pipefail
ref="${1:?usage: scripts/prikbord-setup.sh <project-ref>}"
cd "$(dirname "$0")/.."

if grep -q '^SUPABASE_URL=' .env.local 2>/dev/null; then
  echo ".env.local already has SUPABASE_URL; remove it first if you want to re-run" >&2
  exit 1
fi

key="$({ supabase projects api-keys --project-ref "$ref" --reveal --output-format json 2>/dev/null \
    || supabase projects api-keys --project-ref "$ref" --reveal -o json; } \
  | node -e '
    let s = ""
    process.stdin.on("data", d => s += d).on("end", () => {
      const list = JSON.parse(s)
      const rows = Array.isArray(list) ? list : Object.values(list).flat()
      const val = k => k.api_key ?? k.apiKey ?? k.key ?? k.value ?? ""
      const role = k => {
        const v = val(k)
        if (v.startsWith("sb_secret_")) return "service_role"
        try { return JSON.parse(Buffer.from(v.split(".")[1], "base64url")).role ?? "" } catch { return "" }
      }
      const hit =
        rows.find(k => role(k) === "service_role") ||
        rows.find(k => /service|secret/i.test(`${k.name ?? ""} ${k.type ?? ""}`))
      if (!hit) {
        console.error("no service_role key found; keys seen:", rows.map(k => `${k.name ?? "?"} (${k.type ?? (role(k) || "?")})`).join(", "))
        process.exit(1)
      }
      process.stdout.write(val(hit))
    })')"
{
  echo "SUPABASE_URL=https://${ref}.supabase.co"
  echo "SUPABASE_SERVICE_ROLE_KEY=${key}"
  echo "PRIKBORD_SALT=$(openssl rand -hex 16)"
} >> .env.local
echo "wrote supabase vars to .env.local (restart next dev to pick them up)"
echo
echo "now open https://supabase.com/dashboard/project/${ref}/sql/new and run supabase/prikbord.sql,"
echo "then add the same three vars in vercel: vercel env add SUPABASE_URL production  (etc.)"
