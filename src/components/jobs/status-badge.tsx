import type { JobStatus } from "@/types/database";

const styles: Record<JobStatus, string> = {
  wishlist: "bg-status-wishlist/15 text-status-wishlist",
  applied: "bg-status-applied/15 text-status-applied",
  interview: "bg-status-interview/15 text-status-interview",
  offer: "bg-status-offer/15 text-status-offer",
  rejected: "bg-status-rejected/15 text-status-rejected",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
