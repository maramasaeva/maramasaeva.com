-- Anonymous message board on the homepage. Run once in the supabase sql editor.
-- The site talks to this table with the service role key only (see lib/prikbord.ts),
-- so RLS is on with no policies: the anon key can do nothing here.

create table if not exists prikbord (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'anoniem' check (char_length(name) between 1 and 32),
  body text not null check (char_length(body) between 1 and 280),
  ip_hash text,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table prikbord enable row level security;

create index if not exists prikbord_created_at_idx on prikbord (created_at desc);
create index if not exists prikbord_ip_recent_idx on prikbord (ip_hash, created_at desc);

-- moderation: update prikbord set hidden = true where id = '...';
