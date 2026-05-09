"use client";

import { useState } from "react";
import { Mail, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AIOutput } from "@/types/database";
import type { CoverLetter } from "@/lib/ai/types";

export function CoverLetterPanel({
  jobId,
  initial,
}: {
  jobId: string;
  initial: AIOutput | null;
}) {
  const [output, setOutput] = useState<AIOutput | null>(initial);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, tone }),
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

  const content = output?.content as CoverLetter | undefined;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <h3 className="font-semibold">Cover letter</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) =>
              setTone(e.target.value as "professional" | "enthusiastic" | "concise")
            }
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="concise">Concise</option>
          </select>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {output ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {!content ? (
        <p className="text-sm text-muted-foreground">
          Pick a tone and generate a 250-350 word draft.
        </p>
      ) : (
        <div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(content.letter);
              toast.success("Copied");
            }}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
          <p className="whitespace-pre-wrap text-sm">{content.letter}</p>
        </div>
      )}
    </div>
  );
}
