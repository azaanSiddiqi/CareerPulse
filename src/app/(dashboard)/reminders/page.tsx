import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: reminders = [] } = await supabase
    .from("reminders")
    .select("*, jobs(company, role)")
    .order("due_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
        <p className="text-muted-foreground">
          Upcoming follow-ups, interviews, and deadlines.
        </p>
      </div>

      {reminders && reminders.length > 0 ? (
        <ul className="space-y-3">
          {reminders.map((r) => {
            const job = (r as unknown as { jobs: { company: string; role: string } | null }).jobs;
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {job?.role ?? "—"} <span className="text-muted-foreground">at</span>{" "}
                    {job?.company ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.type.replace("_", " ")} · {formatDate(r.due_at)}
                  </p>
                </div>
                {r.notified_at ? (
                  <span className="text-xs text-muted-foreground">Sent</span>
                ) : (
                  <span className="rounded-full bg-status-interview/10 px-2 py-1 text-xs text-status-interview">
                    Pending
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No reminders yet. Add one from a job&apos;s detail page.
        </div>
      )}
    </div>
  );
}
