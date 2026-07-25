-- Run this once in your Supabase project's SQL editor (Database -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  event_type text not null default 'other',
  event_date date,
  description text,
  owner_password_hash text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  storage_path text not null,
  note text,
  uploaded_at timestamptz not null default now()
);

create index if not exists photos_event_id_idx on photos(event_id);

-- Row Level Security: the app talks to Postgres using the service-role key
-- from server-only API routes, which bypasses RLS by design. Enabling RLS
-- here just means nobody can read/write these tables directly with the
-- public anon key -- all access has to go through your API routes.
alter table events enable row level security;
alter table photos enable row level security;

-- Storage bucket for the actual photo files. Create it from the dashboard
-- instead (Storage -> New bucket -> name it "event-photos" -> Public bucket:
-- ON), or run the snippet below if you prefer SQL.
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;
