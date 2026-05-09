"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Job, JobStatus } from "@/types/database";
import { StatusBadge } from "./status-badge";
import { relativeTime, cn } from "@/lib/utils";

const FILTERS: { key: JobStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interviewing" },
  { key: "offer", label: "Offers" },
  { key: "rejected", label: "Rejected" },
  { key: "wishlist", label: "Wishlist" },
];

export function JobList({
  jobs,
  activeStatus,
  query,
}: {
  jobs: Job[];
  activeStatus?: string;
  query?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setFilter(status: string) {
    const next = new URLSearchParams(params);
    if (status === "all") next.delete("status");
    else next.set("status", status);
    router.push(`/jobs?${next.toString()}`);
  }

  function setSearch(q: string) {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    router.push(`/jobs?${next.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              (activeStatus ?? "all") === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary"
            )}
          >
            {f.label}
          </button>
        ))}
        <input
          defaultValue={query ?? ""}
          placeholder="Search company…"
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-56 rounded-md border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No applications match these filters yet.</p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link
                href={`/jobs/${j.id}`}
                className="flex items-center justify-between p-4 hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{j.role}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {j.company} · added {relativeTime(j.created_at)}
                  </p>
                </div>
                <StatusBadge status={j.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
