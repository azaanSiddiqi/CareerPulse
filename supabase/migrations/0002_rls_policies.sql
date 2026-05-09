-- ============================================================
-- 0002_rls_policies.sql
-- Row-level security: every user sees only their own rows.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.ai_outputs enable row level security;
alter table public.notes enable row level security;
alter table public.reminders enable row level security;

-- profiles -----------------------------------------------------
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- jobs ---------------------------------------------------------
create policy "jobs: select own"
  on public.jobs for select using (auth.uid() = user_id);

create policy "jobs: insert own"
  on public.jobs for insert with check (auth.uid() = user_id);

create policy "jobs: update own"
  on public.jobs for update using (auth.uid() = user_id);

create policy "jobs: delete own"
  on public.jobs for delete using (auth.uid() = user_id);

-- ai_outputs ---------------------------------------------------
create policy "ai_outputs: select own"
  on public.ai_outputs for select using (auth.uid() = user_id);

create policy "ai_outputs: insert own"
  on public.ai_outputs for insert with check (auth.uid() = user_id);

create policy "ai_outputs: delete own"
  on public.ai_outputs for delete using (auth.uid() = user_id);

-- notes --------------------------------------------------------
create policy "notes: select own"
  on public.notes for select using (auth.uid() = user_id);

create policy "notes: insert own"
  on public.notes for insert with check (auth.uid() = user_id);

create policy "notes: update own"
  on public.notes for update using (auth.uid() = user_id);

create policy "notes: delete own"
  on public.notes for delete using (auth.uid() = user_id);

-- reminders ----------------------------------------------------
create policy "reminders: select own"
  on public.reminders for select using (auth.uid() = user_id);

create policy "reminders: insert own"
  on public.reminders for insert with check (auth.uid() = user_id);

create policy "reminders: update own"
  on public.reminders for update using (auth.uid() = user_id);

create policy "reminders: delete own"
  on public.reminders for delete using (auth.uid() = user_id);
