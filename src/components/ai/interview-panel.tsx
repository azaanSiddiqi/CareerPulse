"use client";

import { useState } from "react";
import { MessagesSquare, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AIOutput } from "@/types/database";
import type { InterviewQuestions } from "@/lib/ai/types";

export function InterviewPanel({
  jobId,
  initial,
}: {
  jobId: string;
  initial: AIOutput | null;
}) {
  const [output, setOutput] = useState<AIOutput | null>(initial);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setOutput(json.output);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const content = output?.content as InterviewQuestions | undefined;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          <h3 className="font-semibold">Interview prep</h3>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {output ? "Regenerate" : "Generate"}
        </button>
      </div>

      {!content ? (
        <p className="text-sm text-muted-foreground">
          Behavioral and technical questions tailored to this role.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Behavioral</h4>
            <ul className="space-y-2 text-sm">
              {content.behavioral.map((q, i) => (
                <li key={i} className="rounded-md border bg-background p-3">{q}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Technical</h4>
            <ul className="space-y-2 text-sm">
              {content.technical.map((q, i) => (
                <li key={i} className="rounded-md border bg-background p-3">{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
