import { createClient } from "@/lib/supabase/server";
import { createJobSchema } from "@/lib/validation/job";
import { apiError, fromZodError, ok } from "@/lib/api/response";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("unauthenticated", "Sign in required", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("company", `%${q}%`);

  const { data, count, error } = await query;
  if (error) return apiError("server_error", error.message, 500);

  return ok({ jobs: data, total: count ?? 0 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("unauthenticated", "Sign in required", 401);

  const json = await request.json().catch(() => null);
  const parsed = createJobSchema.safeParse(json);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return apiError("server_error", error.message, 500);
  return ok({ job: data }, 201);
}
