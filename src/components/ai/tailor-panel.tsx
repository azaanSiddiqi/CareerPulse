"use client";

import { useState } from "react";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AIOutput } from "@/types/database";
import type { TailoredResume } from "@/lib/ai/types";

export function TailorPanel({
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
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setOutput(json.output);
      toast.success("Resume tailored");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const content = output?.content as TailoredResume | undefined;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-semibold">Tailored resume</h3>
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
          Click <strong>Generate</strong> to tailor your resume to this posting.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground">Summary</h4>
            <p className="mt-1 text-sm">{content.summary}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium uppercase text-muted-foreground">Bullets</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content.bullets.join("\n"));
                  toast.success("Copied");
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {content.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
