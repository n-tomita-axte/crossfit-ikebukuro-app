import { redirect } from "next/navigation";
import Header from "@/components/Header";
import HandoverBoard from "@/components/HandoverBoard";
import { getSessionProfile } from "@/lib/supabase/profile";
import type { Handover, Profile } from "@/lib/supabase/types";

export default async function HandoversPage() {
  const { supabase, user, profile, canManage } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || (profile.role !== "coach" && !canManage)) redirect("/board");

  const { data } = await supabase
    .from("handovers")
    .select("*")
    .order("done")
    .order("created_at", { ascending: false });

  const [{ data: coachProfilesData }, { data: managerRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "coach"),
    supabase.from("permissions").select("user_id, profiles(*)").eq("permission_key", "manage_roles"),
  ]);

  const handovers = (data as Handover[]) ?? [];
  const coachProfiles = (coachProfilesData as Profile[]) ?? [];
  const nameById = new Map(coachProfiles.map((p) => [p.id, p.display_name]));
  for (const row of (managerRows as { user_id: string; profiles: Profile | null }[] | null) ?? []) {
    if (row.profiles) nameById.set(row.user_id, row.profiles.display_name);
  }

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} canManage={canManage} active="coach" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-chalk-100">コーチ間の申し送り</h1>
        <HandoverBoard handovers={handovers} nameById={Object.fromEntries(nameById)} userId={user.id} />
      </div>
    </main>
  );
}
