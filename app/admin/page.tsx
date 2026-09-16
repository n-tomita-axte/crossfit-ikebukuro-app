import { redirect } from "next/navigation";
import Header from "@/components/Header";
import RoleManager from "@/components/RoleManager";
import { getSessionProfile } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

export default async function AdminPage() {
  const { supabase, user, profile, canManage } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!canManage) redirect("/board");

  const { data } = await supabase.from("profiles").select("*").order("display_name");
  const profiles = (data as Profile[]) ?? [];

  const { data: managers } = await supabase
    .from("permissions")
    .select("user_id")
    .eq("permission_key", "manage_roles");
  const managerIds = new Set((managers ?? []).map((m: { user_id: string }) => m.user_id));

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} canManage={canManage} active="admin" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-2 font-display text-2xl tracking-wide text-chalk-100">権限管理</h1>
        <p className="mb-6 text-sm text-chalk-500">
          「役割」は表示上の立場（会員/コーチ）、「管理操作」は役割変更などができるかどうかの権限です。
          コーチのまま管理操作を持たせることもできます。
        </p>
        <RoleManager profiles={profiles} managerIds={[...managerIds]} currentUserId={user.id} />
      </div>
    </main>
  );
}
