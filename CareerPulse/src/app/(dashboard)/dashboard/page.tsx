import { Briefcase, Calendar, Trophy, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import type { Job } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: jobs = [] } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const allJobs: Job[] = jobs ?? [];
  const total = allJobs.length;
  const interviewing = allJobs.filter((j) => j.status === "interview").length;
  const offers = allJobs.filter((j) => j.status === "offer").length;
  const responseRate =
    total === 0
      ? 0
      : Math.round(
          (allJobs.filter((j) => j.status !== "applied" && j.status !== "wishlist").length /
            total) *
            100
        );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your job search.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total applications" value={total} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard
          label="Interviewing"
          value={interviewing}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard label="Offers" value={offers} icon={<Trophy className="h-4 w-4" />} />
        <StatCard
          label="Response rate"
          value={`${responseRate}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdown jobs={allJobs} />
        <RecentActivity jobs={allJobs.slice(0, 6)} />
      </div>
    </div>
  );
}
