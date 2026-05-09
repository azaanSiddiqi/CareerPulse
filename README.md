# CareerPulse

**AI Job Tracker & Interview Copilot.** A full-stack SaaS that turns the messy job-hunt spreadsheet into a real workflow: paste a job posting, get a tailored resume summary and interview questions, track every application, and never miss a follow-up.

> Built to demonstrate end-to-end product engineering — auth, relational data modeling, AI integration, background jobs, and a polished UI — not just a chatbot wrapper.

---

## What it does

- **Track applications** across statuses (Applied, Interview, Offer, Rejected) with notes and a timeline.
- **Tailor your resume** to a specific job posting. Paste the JD, get 3–5 bullet points rewritten to mirror the role's language.
- **Generate interview questions** — behavioral and technical — sized to the role.
- **Draft cover letters** in seconds, saved per job.
- **Get reminded** before interviews and after long silences (background job + email).
- **Match score** between your base resume and a posting, with the top skills it found and the gaps.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, route handlers, edge-ready |
| Language | TypeScript (strict) | Recruiter signal + safer refactors |
| Styling | Tailwind CSS + shadcn/ui | Production-quality UI fast |
| Database | PostgreSQL via Supabase | Real SQL, RLS, free tier, generated types |
| Auth | Supabase Auth | OAuth + email, RLS-aware |
| AI | Claude **and** OpenAI (provider-agnostic) | Swap via `AI_PROVIDER` env var |
| Email | Resend | Transactional reminders |
| Background jobs | Vercel Cron + queue table | Simple, free, durable |
| Validation | Zod | End-to-end type-safe schemas |
| Hosting | Vercel | Zero-config Next.js deploys |

## Architecture at a glance

```
[ Browser ] ──► Next.js (RSC + Route Handlers)
                    │
                    ├─► Supabase (Postgres + Auth + RLS)
                    │
                    ├─► AI Provider Router ──► Claude  / OpenAI
                    │
                    └─► Resend (email) ◄── Vercel Cron ──► reminder worker
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DATABASE.md`](docs/DATABASE.md), and [`docs/API.md`](docs/API.md).

## Getting started

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in Supabase URL/keys, ANTHROPIC_API_KEY or OPENAI_API_KEY, RESEND_API_KEY

# 3. Database
# In Supabase SQL editor, run the files in supabase/migrations/ in order.
# Then seed sample data:
npm run seed

# 4. Dev
npm run dev
```

Open http://localhost:3000.

## Project structure

```
careerpulse/
├── docs/                    # ARCHITECTURE, DATABASE, API, BUILD_PLAN
├── public/
├── scripts/
│   └── seed.ts              # Sample data: 1 user, 8 jobs, AI outputs, reminders
├── supabase/
│   └── migrations/          # 0001 schema, 0002 RLS, 0003 indexes/triggers
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, signup, OAuth callback
│   │   ├── (dashboard)/     # dashboard, jobs, reminders, settings
│   │   └── api/             # REST + AI + cron endpoints
│   ├── components/
│   │   ├── ai/              # tailor, interview, cover-letter panels
│   │   ├── auth/
│   │   ├── dashboard/       # stat cards, status breakdown
│   │   ├── jobs/            # list, card, form, status tracker
│   │   ├── layout/          # sidebar, header
│   │   └── ui/              # shadcn primitives
│   ├── hooks/
│   ├── lib/
│   │   ├── ai/              # provider router (claude.ts, openai.ts), prompts
│   │   ├── email/
│   │   ├── jobs/            # reminder queue worker
│   │   ├── supabase/        # browser, server, middleware clients
│   │   └── validation/      # zod schemas
│   └── types/
├── middleware.ts
└── package.json
```

## License

MIT
