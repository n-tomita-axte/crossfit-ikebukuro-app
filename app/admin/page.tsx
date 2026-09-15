import { redirect } from "next/navigation";
import Header from "@/components/Header";
import RoleManager from "@/components/RoleManager";
import { getSessionProfile } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

export default async function AdminPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || profile.role !== "admin") redirect("/board");

  const { data } = await supabase.from("profiles").select("*").order("display_name");
  const profiles = (data as Profile[]) ?? [];

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="admin" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-chalk-100">権限管理</h1>
        <RoleManager profiles={profiles} currentUserId={user.id} />
      </div>
    </main>
  );
}
