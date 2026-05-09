import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(opts: {
  to: string;
  subject: string;
  jobCompany: string;
  jobRole: string;
  reminderType: "interview" | "follow_up" | "deadline";
  dueAt: Date;
  message?: string | null;
  jobUrl: string;
}) {
  const heading =
    opts.reminderType === "interview"
      ? `Interview reminder: ${opts.jobRole} at ${opts.jobCompany}`
      : opts.reminderType === "deadline"
      ? `Deadline reminder: ${opts.jobRole} at ${opts.jobCompany}`
      : `Follow-up: ${opts.jobRole} at ${opts.jobCompany}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2 style="margin:0 0 12px">${heading}</h2>
      <p style="color:#475569;margin:0 0 16px">
        Due ${opts.dueAt.toLocaleString()}.
      </p>
      ${opts.message ? `<blockquote style="border-left:3px solid #e2e8f0;padding:0 12px;color:#334155">${opts.message}</blockquote>` : ""}
      <p style="margin:24px 0 0">
        <a href="${opts.jobUrl}" style="background:#0f172a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open in CareerPulse</a>
      </p>
    </div>
  `;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: opts.to,
    subject: opts.subject,
    html,
  });
}
