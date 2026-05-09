# Build Plan — CareerPulse

A realistic four-week plan. Each week ends with a demoable milestone you could record a 30-second clip of.

---

## Week 1 — Foundation

**Goal:** A user can sign up, log in, and the database is ready to store their work.

### Day 1–2: Project setup
- [ ] `npx create-next-app@latest` (Next.js 14, TS, Tailwind, App Router)
- [ ] Install shadcn/ui, lucide-react, zod, @supabase/ssr, @supabase/supabase-js
- [ ] Create Supabase project; copy URL + anon key + service role key into `.env.local`
- [ ] Run migrations `0001_initial_schema.sql`, `0002_rls_policies.sql`, `0003_indexes_triggers.sql`
- [ ] Generate types: `supabase gen types typescript --project-id ... > src/types/database.ts`

### Day 3–4: Auth
- [ ] Wire `lib/supabase/{client,server,middleware}.ts`
- [ ] Build `/login` and `/signup` with email + Google OAuth
- [ ] OAuth callback route at `app/(auth)/callback/route.ts`
- [ ] Protect `(dashboard)` group with `middleware.ts`
- [ ] Test: log out → hit `/dashboard` → redirected to `/login`

### Day 5–7: Layout shell
- [ ] Sidebar nav with Dashboard, Jobs, Reminders, Settings
- [ ] Top bar with user menu (avatar, sign out)
- [ ] Empty states for every page so they don't look broken

**Demo:** sign up, log in, see an empty dashboard.

---

## Week 2 — Core product (jobs CRUD)

**Goal:** The tracker works end to end without any AI.

### Day 8–10: Jobs list + create
- [ ] `app/(dashboard)/jobs/page.tsx` — server component, list jobs from Supabase
- [ ] Status filter chips, company search input
- [ ] `app/(dashboard)/jobs/new/page.tsx` — `JobForm` (Zod-validated) with company, role, JD, link, status
- [ ] `POST /api/jobs` route handler

### Day 11–12: Job detail page (the showpiece)
- [ ] `app/(dashboard)/jobs/[id]/page.tsx`
- [ ] Header: company • role • status pill (clickable to change)
- [ ] Three tabs: **Overview** (JD, link), **Notes** (CRUD), **AI** (placeholder for week 3)
- [ ] Status tracker: Applied → Interview → Offer / Rejected
- [ ] Inline editing for notes

### Day 13–14: Dashboard stats
- [ ] Stat cards: total apps, interviews this week, offers, response rate
- [ ] Status breakdown bar chart (recharts)
- [ ] Recent activity feed (last 10 status changes)

**Demo:** add 5 jobs, change statuses, write notes, see counts update.

---

## Week 3 — AI integration (the wow)

**Goal:** A user pastes a JD and gets useful AI output that's saved to the DB.

### Day 15–16: Provider abstraction
- [ ] `lib/ai/types.ts` — `AIProvider` interface with `tailorResume`, `generateInterviewQuestions`, `generateCoverLetter`, `matchScore`
- [ ] `lib/ai/claude.ts` and `lib/ai/openai.ts` implementations
- [ ] `lib/ai/index.ts` reads `AI_PROVIDER` env var and exports the active provider
- [ ] `lib/ai/prompts.ts` — versioned prompt templates with examples

### Day 17–18: Resume tailoring
- [ ] `POST /api/ai/tailor-resume` — input: `{ jobId }`, output: 3–5 tailored bullets
- [ ] Save to `ai_outputs` (type = 'resume')
- [ ] `TailorPanel` component with "Generate", loading state, result, copy button, regenerate

### Day 19–20: Interview questions + cover letter
- [ ] `POST /api/ai/interview-questions` — behavioral + technical, grouped
- [ ] `POST /api/ai/cover-letter` — uses user's profile + JD
- [ ] Both render in `InterviewPanel` and `CoverLetterPanel`

### Day 21: Match score (bonus)
- [ ] Heuristic + LLM hybrid: extract required skills from JD, intersect with resume
- [ ] Surface as a 0–100 score with "top matched" and "gaps" lists

**Demo:** paste a real JD, watch the bullets stream in, save them, regenerate.

---

## Week 4 — Polish + reminders + deploy

**Goal:** It looks like real software.

### Day 22–23: Reminders
- [ ] `reminders` table is already there; build CRUD UI on job detail page
- [ ] `app/api/cron/send-reminders/route.ts` — runs hourly, finds reminders due in next hour, sends Resend email, marks `notified_at`
- [ ] `vercel.json` cron config

### Day 24–25: UI polish
- [ ] Empty states with illustrations (lucide icons + text)
- [ ] Skeleton loaders on every server-fetched view
- [ ] Toast notifications for every mutation (sonner or shadcn)
- [ ] Dark mode toggle
- [ ] Keyboard shortcut: `n` to add a new job

### Day 26–27: Settings + resume upload
- [ ] Profile (name, default base resume text)
- [ ] Optional: PDF upload to Supabase Storage with text extraction (pdf-parse)

### Day 28: Deploy
- [ ] Push to GitHub (clean commits, good README)
- [ ] Deploy to Vercel
- [ ] Add custom domain (optional)
- [ ] Record a 60-second demo video for the README

**Demo:** the live URL.

---

## What to avoid

- Don't dump raw LLM output to the screen. Parse and render structured.
- Don't skip RLS. Recruiters who look at the SQL will notice.
- Don't ship without empty states and loading states.
- Don't commit `.env.local`.
- Don't write a 5,000-word README. The product should speak for itself.
