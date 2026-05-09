-- ============================================================
-- 0001_initial_schema.sql
-- CareerPulse — initial schema
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Status enum --------------------------------------------------
do $$ begin
  create type job_status as enum ('wishlist', 'applied', 'interview', 'offer', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ai_output_type as enum ('resume', 'interview', 'cover_letter', 'match_score');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_type as enum ('interview', 'follow_up', 'deadline');
exception when duplicate_object then null; end $$;

-- Tables -------------------------------------------------------

-- profiles mirrors auth.users with app fields
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  base_resume text,
  ai_provider_pref text check (ai_provider_pref in ('anthropic', 'openai')),
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company text not null,
  role text not null,
  description text,
  link text,
  status job_status not null default 'applied',
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type ai_output_type not null,
  content jsonb not null,
  model text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  due_at timestamptz not null,
  type reminder_type not null default 'follow_up',
  message text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);
