import { redirect } from "next/navigation";
import Header from "@/components/Header";
import HandoverBoard from "@/components/HandoverBoard";
import { getSessionProfile } from "@/lib/supabase/profile";
import type { Handover, Profile } from "@/lib/supabase/types";

export default async function HandoversPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || (profile.role !== "coach" && profile.role !== "admin")) redirect("/board");

  const { data } = await supabase
    .from("handovers")
    .select("*")
    .order("done")
    .order("created_at", { ascending: false });

  const { data: coachProfilesData } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["coach", "admin"]);

  const handovers = (data as Handover[]) ?? [];
  const coachProfiles = (coachProfilesData as Profile[]) ?? [];
  const nameById = new Map(coachProfiles.map((p) => [p.id, p.display_name]));

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="coach" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-chalk-100">コーチ間の申し送り</h1>
        <HandoverBoard handovers={handovers} nameById={Object.fromEntries(nameById)} userId={user.id} />
      </div>
    </main>
  );
}
