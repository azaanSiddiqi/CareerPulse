# Database

PostgreSQL via Supabase. Five tables, all with row-level security.

```
profiles           jobs                 ai_outputs
┌─────────┐        ┌────────────────┐   ┌──────────────┐
│ id (pk) │◄───┐   │ id (pk)        │◄──┤ job_id (fk)  │
│ email   │    │   │ user_id (fk) ──┘   │ type         │
│ full_   │    │   │ company        │   │ content      │
│  name   │    │   │ role           │   │ model        │
│ base_   │    │   │ description    │   │ prompt_ver   │
│  resume │    │   │ link           │   │ created_at   │
│ ...     │    │   │ status         │   └──────────────┘
└─────────┘    │   │ applied_at     │
               │   │ created_at     │   notes
               │   └──────┬─────────┘   ┌──────────────┐
               │          │             │ id (pk)      │
               │          ├────────────►│ job_id (fk)  │
               │          │             │ content      │
               │          │             │ created_at   │
               │          │             └──────────────┘
               │          │
               │          │             reminders
               │          │             ┌──────────────┐
               │          └────────────►│ id (pk)      │
               │                        │ job_id (fk)  │
               │                        │ user_id (fk) │
               └────────────────────────┤ due_at       │
                                        │ type         │
                                        │ notified_at  │
                                        └──────────────┘
```

## Tables

### `profiles`

Mirrors `auth.users` with app-specific fields. Created via trigger when a user signs up.

| column | type | notes |
|---|---|---|
| id | uuid pk | references `auth.users(id)` on delete cascade |
| email | text | denormalized from `auth.users` for convenience |
| full_name | text | nullable |
| base_resume | text | the user's default resume, used as input to tailoring |
| ai_provider_pref | text | `'anthropic'` \| `'openai'` \| null (use server default) |
| created_at | timestamptz | default now() |

### `jobs`

| column | type | notes |
|---|---|---|
| id | uuid pk | default `gen_random_uuid()` |
| user_id | uuid | fk → `profiles(id)` on delete cascade |
| company | text not null | |
| role | text not null | |
| description | text | the pasted JD |
| link | text | nullable |
| status | text | enum-checked: `applied` \| `interview` \| `offer` \| `rejected` \| `wishlist` |
| applied_at | timestamptz | when the user applied |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | bumped by trigger |

Indexes: `(user_id, created_at desc)`, `(user_id, status)`.

### `ai_outputs`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| job_id | uuid | fk → `jobs(id)` on delete cascade |
| user_id | uuid | denormalized for RLS efficiency |
| type | text | `resume` \| `interview` \| `cover_letter` \| `match_score` |
| content | jsonb | structured output (bullets[], questions[], score, etc.) |
| model | text | e.g. `claude-sonnet-4-6`, `gpt-4o` |
| prompt_version | text | so old outputs aren't lost when prompts change |
| created_at | timestamptz | |

### `notes`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| job_id | uuid | fk → `jobs(id)` on delete cascade |
| user_id | uuid | denormalized for RLS |
| content | text | |
| created_at | timestamptz | |

### `reminders`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| job_id | uuid | fk → `jobs(id)` on delete cascade |
| user_id | uuid | denormalized for RLS |
| due_at | timestamptz | |
| type | text | `interview` \| `follow_up` \| `deadline` |
| message | text | nullable, custom note shown in email |
| notified_at | timestamptz | nullable; set by cron job once email is sent |
| created_at | timestamptz | |

Index: `(notified_at, due_at)` for the cron query.

## RLS policies

Every table has `enable row level security`. Pattern for each:

```sql
create policy "users see their own rows"
  on jobs for select using (auth.uid() = user_id);

create policy "users insert their own rows"
  on jobs for insert with check (auth.uid() = user_id);

create policy "users update their own rows"
  on jobs for update using (auth.uid() = user_id);

create policy "users delete their own rows"
  on jobs for delete using (auth.uid() = user_id);
```

The cron job uses the **service role** key, which bypasses RLS — that's how it can read every user's reminders.

## Triggers

- `handle_new_user()` — on `auth.users` insert, create a matching `profiles` row.
- `set_updated_at()` — on `jobs` update, bump `updated_at`.

Both are in `supabase/migrations/0003_indexes_triggers.sql`.

## Generating types

```bash
supabase gen types typescript --project-id <your-id> > src/types/database.ts
```

Re-run after every migration.
