/**
 * Seed script — populates a demo user with realistic sample data.
 *
 * Usage:
 *   npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment (it bypasses RLS).
 *
 * What it creates:
 *   - 1 demo profile (demo@careerpulse.dev) with a base resume
 *   - 8 jobs spanning every status
 *   - AI outputs (resume, interview, cover letter) on 3 of them
 *   - Notes on 4 jobs
 *   - 3 reminders (one in the past, two upcoming)
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Run with: npm run seed  (tsx --env-file=.env.local handles loading)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@careerpulse.dev";
const DEMO_PASSWORD = "demo-password-change-me";

const BASE_RESUME = `Alex Rivera
Software Engineer · alex@example.com · github.com/alex

EXPERIENCE
Stripe — Software Engineer (2023–present)
- Cut p95 webhook latency by 38% by replacing a synchronous fan-out with a Postgres NOTIFY-based queue.
- Owned migration of the billing reconciliation service from Ruby to Go; reduced incident count by 60%.

Cloudflare — Software Engineer Intern (Summer 2022)
- Built a TypeScript CLI for edge-config rollouts used by 200+ engineers.

EDUCATION
B.S. Computer Science, UC Berkeley (2023). GPA 3.8.

SKILLS
TypeScript, Go, Postgres, Redis, Kafka, AWS, Terraform.`;

const SAMPLE_JOBS = [
  {
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "interview",
    description:
      "Build the Next.js dashboard. You'll work in TypeScript and React Server Components, ship to millions of developers, and own product surface area end-to-end. We value people who write less code, not more.",
    link: "https://vercel.com/careers",
    applied_at: daysAgo(14),
  },
  {
    company: "Linear",
    role: "Product Engineer",
    status: "applied",
    description:
      "Linear is hiring product engineers who care about craft. You'll build features end-to-end across our TypeScript stack (React, GraphQL, Postgres). Strong design taste and obsessive attention to performance required.",
    link: "https://linear.app/careers",
    applied_at: daysAgo(5),
  },
  {
    company: "Supabase",
    role: "Full-stack Engineer",
    status: "offer",
    description:
      "Help shape the open-source Postgres developer platform. We're hiring engineers comfortable across the stack — TS, Go, Elixir — with a bias toward shipping.",
    link: "https://supabase.com/careers",
    applied_at: daysAgo(28),
  },
  {
    company: "Anthropic",
    role: "AI Product Engineer",
    status: "interview",
    description:
      "Build the surfaces that bring Claude to developers. You'll ship AI-powered features, work on prompts and evals, and prototype new product ideas weekly.",
    link: "https://anthropic.com/careers",
    applied_at: daysAgo(10),
  },
  {
    company: "Stripe",
    role: "Software Engineer, Billing",
    status: "rejected",
    description:
      "Build the billing platform that powers internet businesses. Strong systems and SQL skills required.",
    link: "https://stripe.com/jobs",
    applied_at: daysAgo(40),
  },
  {
    company: "Figma",
    role: "Senior Software Engineer",
    status: "applied",
    description:
      "Work on the multiplayer design canvas. C++, TypeScript, and a love for making the impossible feel obvious.",
    link: "https://figma.com/careers",
    applied_at: daysAgo(2),
  },
  {
    company: "Notion",
    role: "Software Engineer",
    status: "wishlist",
    description: "Dream job. Apply when there's a fit.",
    link: "https://notion.so/careers",
    applied_at: null,
  },
  {
    company: "Replit",
    role: "Software Engineer, Agents",
    status: "interview",
    description:
      "Build agentic developer tools that write, test, and ship code. Heavy use of LLMs, sandboxing, and TS.",
    link: "https://replit.com/careers",
    applied_at: daysAgo(7),
  },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}

async function getOrCreateUser() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Alex Rivera" },
  });
  if (error) throw error;
  return data.user!.id;
}

async function main() {
  console.log("Seeding CareerPulse…");

  const userId = await getOrCreateUser();
  console.log(`  user: ${DEMO_EMAIL} (${userId})`);

  // Wait a beat for the on-auth trigger to create the profile row.
  await new Promise((r) => setTimeout(r, 500));

  await supabase
    .from("profiles")
    .update({
      full_name: "Alex Rivera",
      base_resume: BASE_RESUME,
      ai_provider_pref: null,
    })
    .eq("id", userId);

  // Reset existing demo data so re-runs are clean.
  await supabase.from("jobs").delete().eq("user_id", userId);

  const jobsToInsert = SAMPLE_JOBS.map((j) => ({
    id: randomUUID(),
    user_id: userId,
    ...j,
  }));
  const { error: jobsErr } = await supabase.from("jobs").insert(jobsToInsert);
  if (jobsErr) throw jobsErr;
  console.log(`  jobs: ${jobsToInsert.length}`);

  const vercel = jobsToInsert.find((j) => j.company === "Vercel")!;
  const anthropic = jobsToInsert.find((j) => j.company === "Anthropic")!;
  const supabaseJob = jobsToInsert.find((j) => j.company === "Supabase")!;

  // AI outputs
  const aiOutputs = [
    {
      job_id: vercel.id,
      user_id: userId,
      type: "resume" as const,
      content: {
        summary:
          "Frontend-leaning full-stack engineer with five years shipping production TypeScript. Comfortable across the React Server Components frontier, with a track record of cutting latency on real systems.",
        bullets: [
          "Cut p95 webhook latency by 38% at Stripe by replacing a synchronous fan-out with a Postgres NOTIFY-based queue.",
          "Migrated the billing reconciliation service from Ruby to Go, reducing incident count by 60% over six months.",
          "Built a TypeScript CLI used by 200+ Cloudflare engineers for edge-config rollouts.",
          "Strong React + Next.js fluency; ship daily in TypeScript and own surface area end-to-end.",
        ],
      },
      model: "claude-sonnet-4-6",
      prompt_version: "2026-05-04.v1",
    },
    {
      job_id: anthropic.id,
      user_id: userId,
      type: "interview" as const,
      content: {
        behavioral: [
          "Tell me about a time you shipped an AI feature and the model behaved unexpectedly. What did you do?",
          "Describe a time you cut scope to meet a deadline. What did you cut and why?",
          "Walk me through a project where you wrote and iterated on prompts. What did your eval loop look like?",
          "When have you disagreed with a PM on what to build? How did you resolve it?",
          "Tell me about the last debugging session that took longer than a day. What was the root cause?",
          "What's a feature you killed that you're proud of killing?",
        ],
        technical: [
          "How would you design an API for a feature that calls an LLM with a 30-second p95 latency?",
          "Walk through how you'd evaluate whether a prompt change is actually better.",
          "How would you handle PII in user inputs sent to a third-party model?",
          "Design a streaming-first architecture for a chat UI with retry semantics.",
          "Compare server-side and edge caching strategies for an LLM-backed API.",
          "How would you A/B test a prompt change to a feature used by 1M users?",
        ],
      },
      model: "claude-sonnet-4-6",
      prompt_version: "2026-05-04.v1",
    },
    {
      job_id: supabaseJob.id,
      user_id: userId,
      type: "cover_letter" as const,
      content: {
        letter:
          "Most developer-tool companies talk about being open. Supabase is one of the few that actually ships the source.\n\nI've spent the last two years building on Postgres at Stripe — replacing a synchronous fan-out with a NOTIFY-driven queue cut our p95 webhook latency by 38%, and the win came from leaning harder into the database, not around it. That's the same instinct I'd bring to Supabase: trust Postgres, expose its power cleanly, and treat the developer experience as the product.\n\nI'd love to work on the realtime layer. The combination of replication slots, broadcast, and presence is the kind of system I want to be obsessing over for the next few years. I'm also comfortable across the stack — Go and TypeScript day-to-day, Elixir is on my reading list — and I prefer shipping small things often.\n\nWould love to talk.",
      },
      model: "gpt-4o-mini",
      prompt_version: "2026-05-04.v1",
    },
  ];
  await supabase.from("ai_outputs").insert(aiOutputs);
  console.log(`  ai_outputs: ${aiOutputs.length}`);

  const notes = [
    {
      job_id: vercel.id,
      user_id: userId,
      content: "Recruiter call went well. Next: technical screen with the Next.js dashboard team.",
    },
    {
      job_id: anthropic.id,
      user_id: userId,
      content: "Take-home assigned 2026-05-02. Due in one week. Prompt eval harness.",
    },
    {
      job_id: supabaseJob.id,
      user_id: userId,
      content: "Offer extended! Comp: $185k base + equity. Need to respond by 2026-05-12.",
    },
    {
      job_id: jobsToInsert.find((j) => j.company === "Linear")!.id,
      user_id: userId,
      content: "Submitted via referral from Mark.",
    },
  ];
  await supabase.from("notes").insert(notes);
  console.log(`  notes: ${notes.length}`);

  const reminders = [
    {
      job_id: vercel.id,
      user_id: userId,
      due_at: daysFromNow(2),
      type: "interview" as const,
      message: "Onsite loop 10am PT. Prep: system design for a typed-edge cache.",
    },
    {
      job_id: supabaseJob.id,
      user_id: userId,
      due_at: daysFromNow(8),
      type: "deadline" as const,
      message: "Offer expires. Decide.",
    },
    {
      job_id: jobsToInsert.find((j) => j.company === "Linear")!.id,
      user_id: userId,
      due_at: daysFromNow(5),
      type: "follow_up" as const,
      message: "Ping Mark for update if no recruiter reply.",
    },
  ];
  await supabase.from("reminders").insert(reminders);
  console.log(`  reminders: ${reminders.length}`);

  console.log("\nDone.\n");
  console.log(`Log in with:`);
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
