import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <Sidebar />
      <div className="flex-1">
        <Header userEmail={user.email ?? ""} />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
