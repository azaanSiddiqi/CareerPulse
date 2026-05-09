import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, FileText, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-lg font-semibold">CareerPulse</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="container py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          AI-powered job-hunt copilot
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Stop juggling tabs.{" "}
          <span className="text-muted-foreground">Run your job search like a product.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Paste a job posting, get a tailored resume summary and interview questions in seconds,
          and never lose track of an application or follow-up again.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border px-6 py-3 hover:bg-secondary"
          >
            See features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container grid gap-6 pb-24 md:grid-cols-3">
        <Feature
          icon={<FileText className="h-5 w-5" />}
          title="Tailored resumes"
          body="Paste any job description and get 3-5 bullet points rewritten in the JD's language, grounded in your real experience."
        />
        <Feature
          icon={<Target className="h-5 w-5" />}
          title="Interview prep"
          body="Behavioral and technical question banks generated from the role's actual responsibilities."
        />
        <Feature
          icon={<Calendar className="h-5 w-5" />}
          title="Reminders that ship"
          body="Email follow-ups, interview alerts, and deadline pings. Cron-driven, no setup required."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
