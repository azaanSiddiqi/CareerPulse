/**
 * Wipes the demo user's data so `npm run seed` can start fresh.
 * Does NOT drop the user — only deletes their jobs (cascades to outputs,
 * notes, reminders).
 */
import { createClient } from "@supabase/supabase-js";

// Run with: npm run db:reset  (tsx --env-file=.env.local handles loading)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_EMAIL = "demo@careerpulse.dev";

async function main() {
  const { data } = await supabase.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === DEMO_EMAIL);
  if (!user) {
    console.log("No demo user found — nothing to reset.");
    return;
  }
  await supabase.from("jobs").delete().eq("user_id", user.id);
  console.log(`Reset jobs for ${DEMO_EMAIL}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
