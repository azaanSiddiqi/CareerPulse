"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types/database";

const STAGES: { status: JobStatus; label: string }[] = [
  { status: "wishlist", label: "Wishlist" },
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interviewing" },
  { status: "offer", label: "Offer" },
];

export function StatusTracker({
  jobId,
  status: initialStatus,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [pending, start] = useTransition();
  const router = useRouter();

  const currentIdx = STAGES.findIndex((s) => s.status === status);
  const isRejected = status === "rejected";

  async function update(next: JobStatus) {
    const prev = status;
    setStatus(next);
    start(async () => {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(prev);
        toast.error("Failed to update status");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
        <button
          disabled={pending}
          onClick={() => update(isRejected ? "applied" : "rejected")}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {isRejected ? "Mark as active" : "Mark rejected"}
        </button>
      </div>
      <ol className="flex items-center gap-2">
        {STAGES.map((s, i) => {
          const reached = i <= currentIdx && !isRejected;
          return (
            <li key={s.status} className="flex flex-1 items-center gap-2">
              <button
                disabled={pending}
                onClick={() => update(s.status)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                )}
              >
                {i + 1}
              </button>
              <span className="text-xs font-medium">{s.label}</span>
              {i < STAGES.length - 1 && (
                <div className={cn("h-px flex-1", reached ? "bg-primary" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
