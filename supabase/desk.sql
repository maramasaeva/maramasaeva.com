-- the desk (/desk): mara's private reply desk. rows are written only by the
-- server with the service role key; nothing is exposed to anon/authenticated.

create table if not exists desk_items (
  id text primary key,                 -- tweet id
  author text not null,                -- handle, lowercase
  author_name text,
  text text not null,
  created_at timestamptz not null,
  metrics jsonb,
  hidden boolean not null default false,
  fetched_at timestamptz not null default now()
);
create index if not exists desk_items_created_at on desk_items (created_at desc);
create index if not exists desk_items_author on desk_items (author, id desc);

-- what went out through the desk, for the record
create table if not exists desk_posts (
  id text primary key,                 -- tweet id returned by x
  text text not null,
  kind text not null,                  -- reply | quote | post
  target text,                         -- tweet id replied to / quoted
  created_at timestamptz not null default now()
);

-- small key/value: last refresh time, login failure counter
create table if not exists desk_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table desk_items enable row level security;
alter table desk_posts enable row level security;
alter table desk_meta enable row level security;
revoke all on table desk_items from anon, authenticated;
revoke all on table desk_posts from anon, authenticated;
revoke all on table desk_meta from anon, authenticated;
