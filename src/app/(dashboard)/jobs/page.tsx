import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobList } from "@/components/jobs/job-list";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  if (params.q) query = query.ilike("company", `%${params.q}%`);

  const { data: jobs } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            {jobs?.length ?? 0} job{(jobs?.length ?? 0) === 1 ? "" : "s"} tracked
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add job
        </Link>
      </div>

      <JobList jobs={jobs ?? []} activeStatus={params.status} query={params.q} />
    </div>
  );
}
