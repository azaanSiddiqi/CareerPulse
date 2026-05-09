import Link from "next/link";
import type { Job } from "@/types/database";
import { StatusBadge } from "@/components/jobs/status-badge";
import { relativeTime } from "@/lib/utils";

export function RecentActivity({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
        <Link href="/jobs" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No jobs yet.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between">
              <Link href={`/jobs/${j.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{j.role}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {j.company} · {relativeTime(j.created_at)}
                </p>
              </Link>
              <StatusBadge status={j.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
