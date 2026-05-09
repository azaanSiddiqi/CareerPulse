import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Profile and AI preferences.</p>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="col-span-2">{user!.email}</dd>
          <dt className="text-muted-foreground">Name</dt>
          <dd className="col-span-2">{profile?.full_name ?? "—"}</dd>
          <dt className="text-muted-foreground">AI provider</dt>
          <dd className="col-span-2">{profile?.ai_provider_pref ?? "Default (server)"}</dd>
        </dl>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Base resume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used as the source of truth when tailoring. Paste a clean text version of your resume.
        </p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-secondary/50 p-4 text-xs">
          {profile?.base_resume ?? "No base resume saved yet."}
        </pre>
      </section>
    </div>
  );
}
