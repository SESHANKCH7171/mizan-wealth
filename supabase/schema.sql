-- Mizan (ميزان) Supabase Schema Reference
-- Run in Supabase SQL Editor if setting up a fresh project

create table if not exists public.mizan_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Lock the table so ONLY your logged-in account can read or write
alter table public.mizan_state enable row level security;

create policy "Private user access only"
on public.mizan_state
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
