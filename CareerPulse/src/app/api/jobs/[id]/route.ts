import { createClient } from "@/lib/supabase/server";
import { updateJobSchema } from "@/lib/validation/job";
import { apiError, fromZodError, ok } from "@/lib/api/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: job, error }, { data: notes }, { data: ai }, { data: reminders }] =
    await Promise.all([
      supabase.from("jobs").select("*").eq("id", id).single(),
      supabase.from("notes").select("*").eq("job_id", id).order("created_at", { ascending: false }),
      supabase
        .from("ai_outputs")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("reminders").select("*").eq("job_id", id).order("due_at"),
    ]);

  if (error || !job) return apiError("not_found", "Job not found", 404);
  return ok({ job, notes, ai_outputs: ai, reminders });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const json = await request.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(json);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await supabase
    .from("jobs")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError("server_error", error.message, 500);
  return ok({ job: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return apiError("server_error", error.message, 500);
  return new Response(null, { status: 204 });
}
