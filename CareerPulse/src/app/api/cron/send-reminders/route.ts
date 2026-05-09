import { createServiceClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/resend";
import { apiError, ok } from "@/lib/api/response";

/**
 * Hourly cron. Vercel calls with `Authorization: Bearer ${CRON_SECRET}`.
 * Finds reminders due in the next hour, emails them, marks notified.
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError("forbidden", "Bad cron secret", 403);
  }

  const supabase = createServiceClient();

  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const { data: due } = await supabase
    .from("reminders")
    .select("*, jobs(company, role), profiles!reminders_user_id_fkey(email)")
    .is("notified_at", null)
    .lte("due_at", inOneHour.toISOString());

  if (!due?.length) return ok({ sent: 0 });

  let sent = 0;
  for (const r of due) {
    type WithJoins = typeof r & {
      jobs: { company: string; role: string } | null;
      profiles: { email: string } | null;
    };
    const row = r as WithJoins;
    const email = row.profiles?.email;
    if (!email || !row.jobs) continue;

    try {
      await sendReminderEmail({
        to: email,
        subject: `[CareerPulse] ${row.jobs.role} — ${row.type.replace("_", " ")}`,
        jobCompany: row.jobs.company,
        jobRole: row.jobs.role,
        reminderType: row.type,
        dueAt: new Date(row.due_at),
        message: row.message,
        jobUrl: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${row.job_id}`,
      });
      await supabase
        .from("reminders")
        .update({ notified_at: now.toISOString() })
        .eq("id", row.id);
      sent++;
    } catch (e) {
      console.error("reminder failed", row.id, e);
    }
  }

  return ok({ sent, considered: due.length });
}
