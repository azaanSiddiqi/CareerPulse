"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Job, JobStatus } from "@/types/database";

const STATUSES: JobStatus[] = ["wishlist", "applied", "interview", "offer", "rejected"];

export function StatusBreakdown({ jobs }: { jobs: Job[] }) {
  const data = STATUSES.map((s) => ({
    status: s,
    count: jobs.filter((j) => j.status === s).length,
  }));

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-medium text-muted-foreground">Status breakdown</h2>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
