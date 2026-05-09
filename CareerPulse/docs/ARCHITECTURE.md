# Architecture

## High-level

```
                          ┌────────────────────┐
                          │   Browser (RSC)    │
                          └─────────┬──────────┘
                                    │  HTTPS
                          ┌─────────▼──────────┐
                          │   Next.js 14       │
                          │   App Router       │
                          │   Route handlers   │
                          └────┬────────┬──────┘
                               │        │
                ┌──────────────┘        └──────────────┐
                │                                      │
        ┌───────▼────────┐                    ┌────────▼─────────┐
        │  Supabase      │                    │  AI Provider     │
        │  Postgres + RLS│                    │  Router          │
        │  Auth          │                    │  (Claude/OpenAI) │
        │  Storage       │                    └──────────────────┘
        └────────────────┘
                ▲
                │
        ┌───────┴────────┐
        │  Vercel Cron   │  hourly
        │  reminder job  │──► Resend (email)
        └────────────────┘
```

## Why these pieces

**Next.js App Router** gives us server components (so list pages can fetch directly from Postgres without a client-side fetch round trip), route handlers for the API surface, and middleware for auth gating. It's the dominant React meta-framework in 2025 job postings.

**Supabase** is Postgres with batteries — Auth, RLS, generated TS types, free tier. We don't hide behind an ORM; queries use `@supabase/supabase-js` directly so the SQL is visible and the RLS does the heavy lifting on access control.

**Provider-agnostic AI layer.** All AI calls go through `lib/ai/index.ts`, which reads `AI_PROVIDER` (`anthropic` or `openai`) and dispatches to the matching implementation. Both implement the same `AIProvider` interface, so the API routes don't know or care which model is running. This is the kind of small abstraction that shows you've built more than a wrapper.

**Vercel Cron + Resend** for reminders. A simple cron route handler (`/api/cron/send-reminders`) runs hourly, queries `reminders WHERE due_at < now() + 1h AND notified_at IS NULL`, sends emails via Resend, then marks the rows. No third-party queue needed for the MVP.

## Request flow: tailor a resume

1. User clicks **Generate** on the job detail page.
2. Client calls `POST /api/ai/tailor-resume` with `{ jobId }`.
3. Route handler:
   - Authenticates via Supabase server client.
   - Fetches the job and the user's `base_resume` (RLS enforces ownership).
   - Calls `getAIProvider().tailorResume({ jobDescription, baseResume })`.
   - Inserts the result into `ai_outputs` with `type = 'resume'`.
4. Client revalidates and renders the new bullets.

## Auth flow

- `middleware.ts` runs on every request to `/dashboard/*` and refreshes the Supabase session cookie.
- Server components use `createServerClient(cookies())` for SSR-safe reads.
- Route handlers use the same server client and then enforce per-user filters via RLS.
- The browser uses `createBrowserClient()` for any client-side mutations (rare; we prefer server actions or route handlers).

## Folder conventions

- `src/app/(auth)/` and `src/app/(dashboard)/` are route groups — they share layouts but don't add to the URL.
- Anything under `src/app/api/` is a route handler (REST or AI).
- `src/lib/` is environment-agnostic logic. `src/components/` is presentation.
- Database types live in `src/types/database.ts` and are regenerated from Supabase CLI.

## Performance

- Job list uses Postgres pagination (`limit/offset`) and an index on `(user_id, created_at desc)`.
- AI responses stream where possible (`Response` with `ReadableStream`) so users see tokens immediately.
- Dashboard counts use a single aggregated query (no N+1).

## Security

- Row-level security on every table — non-negotiable.
- Service role key is never sent to the browser; it's only used in the cron job and the seed script.
- AI inputs and outputs are sanitized before persisting (no raw HTML stored).
- Resume PDFs (stretch goal) are uploaded to a private Supabase Storage bucket with signed URLs.
