-- ClassBrief database setup.
-- Paste this whole file into Supabase: SQL Editor -> New query -> Run.
-- It is safe to run more than once.

-- Topics a student follows. Each row belongs to one user.
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  -- Filled in automatically with the logged-in user's id.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists topics_user_id_idx on public.topics (user_id);

-- Row Level Security: nobody can read or change anything unless a policy allows it.
alter table public.topics enable row level security;

-- Logged-out visitors (the "anon" role) get no access at all.
revoke all on public.topics from anon;
-- Logged-in users may use the table, but only within the policies below.
grant select, insert, update, delete on public.topics to authenticated;

-- Logged-in users can only see, add, change and delete their OWN topics.
drop policy if exists "Users can read their own topics" on public.topics;
create policy "Users can read their own topics"
  on public.topics for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own topics" on public.topics;
create policy "Users can add their own topics"
  on public.topics for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own topics" on public.topics;
create policy "Users can update their own topics"
  on public.topics for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own topics" on public.topics;
create policy "Users can delete their own topics"
  on public.topics for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Day 3: AI usage log, used to rate-limit AI summaries (they cost money).
-- One row per summary request. Users can only see and add their own rows,
-- and cannot delete them (so they can't reset their own limit).
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_time_idx on public.ai_usage (user_id, created_at);

alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon;
grant select, insert on public.ai_usage to authenticated;

drop policy if exists "Users can read their own AI usage" on public.ai_usage;
create policy "Users can read their own AI usage"
  on public.ai_usage for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can log their own AI usage" on public.ai_usage;
create policy "Users can log their own AI usage"
  on public.ai_usage for insert to authenticated
  with check ((select auth.uid()) = user_id);
