import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai";
import { aiRequestSchema } from "@/lib/validation/ai";
import { apiError, fromZodError, ok } from "@/lib/api/response";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("unauthenticated", "Sign in required", 401);

  const json = await request.json().catch(() => null);
  const parsed = aiRequestSchema.safeParse(json);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", parsed.data.jobId)
    .single();
  if (!job) return apiError("not_found", "Job not found", 404);

  const { data: profile } = await supabase
    .from("profiles")
    .select("base_resume, ai_provider_pref")
    .eq("id", user.id)
    .single();

  if (!profile?.base_resume) {
    return apiError(
      "invalid_input",
      "Add a base resume in Settings before tailoring.",
      400
    );
  }

  const provider = getAIProvider(parsed.data.provider ?? profile.ai_provider_pref ?? null);

  let result;
  try {
    result = await provider.tailorResume({
      jobDescription: job.description ?? "",
      jobRole: job.role,
      jobCompany: job.company,
      baseResume: profile.base_resume,
    });
  } catch (e) {
    return apiError("ai_provider_error", (e as Error).message, 502);
  }

  const { data: saved, error } = await supabase
    .from("ai_outputs")
    .insert({
      job_id: job.id,
      user_id: user.id,
      type: "resume",
      content: result,
      model: provider.model,
      prompt_version: provider.promptVersion,
    })
    .select()
    .single();
  if (error) return apiError("server_error", error.message, 500);

  return ok({ output: saved }, 201);
}
