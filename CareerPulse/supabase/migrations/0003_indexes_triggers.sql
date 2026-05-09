-- ============================================================
-- 0003_indexes_triggers.sql
-- Performance indexes + triggers
-- ============================================================

-- Indexes ------------------------------------------------------
create index if not exists jobs_user_created_idx on public.jobs (user_id, created_at desc);
create index if not exists jobs_user_status_idx on public.jobs (user_id, status);
create index if not exists ai_outputs_job_idx on public.ai_outputs (job_id, created_at desc);
create index if not exists notes_job_idx on public.notes (job_id, created_at desc);
create index if not exists reminders_due_idx on public.reminders (notified_at, due_at)
  where notified_at is null;

-- Trigger: bump updated_at on jobs -----------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- Trigger: create profile when a user signs up -----------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
