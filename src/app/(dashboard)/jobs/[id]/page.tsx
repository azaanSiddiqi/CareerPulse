import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusTracker } from "@/components/jobs/status-tracker";
import { TailorPanel } from "@/components/ai/tailor-panel";
import { InterviewPanel } from "@/components/ai/interview-panel";
import { CoverLetterPanel } from "@/components/ai/cover-letter-panel";
import { formatDate } from "@/lib/utils";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (!job) notFound();

  const { data: aiOutputs = [] } = await supabase
    .from("ai_outputs")
    .select("*")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  const { data: notes = [] } = await supabase
    .from("notes")
    .select("*")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  const latestResume = aiOutputs?.find((o) => o.type === "resume");
  const latestInterview = aiOutputs?.find((o) => o.type === "interview");
  const latestCover = aiOutputs?.find((o) => o.type === "cover_letter");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{job.company}</p>
        <h1 className="text-3xl font-bold tracking-tight">{job.role}</h1>
        <p className="text-sm text-muted-foreground">
          Added {formatDate(job.created_at)}
          {job.link && (
            <>
              {" · "}
              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Original posting
              </a>
            </>
          )}
        </p>
      </header>

      <StatusTracker jobId={job.id} status={job.status} />

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Job description</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {job.description ?? "No description saved."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">AI Copilot</h2>
        <TailorPanel jobId={job.id} initial={latestResume ?? null} />
        <InterviewPanel jobId={job.id} initial={latestInterview ?? null} />
        <CoverLetterPanel jobId={job.id} initial={latestCover ?? null} />
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        {notes && notes.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border bg-background p-3">
                <p className="whitespace-pre-wrap">{n.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </section>
    </div>
  );
}
