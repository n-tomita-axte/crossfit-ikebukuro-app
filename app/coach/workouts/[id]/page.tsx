import { redirect, notFound } from "next/navigation";
import Header from "@/components/Header";
import WorkoutEditor from "@/components/WorkoutEditor";
import { getSessionProfile } from "@/lib/supabase/profile";
import { todayJst } from "@/lib/date";
import type { Program, Workout, WorkoutTemplate } from "@/lib/supabase/types";

export default async function WorkoutEditorPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { program?: string; date?: string };
}) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || (profile.role !== "coach" && profile.role !== "admin")) redirect("/board");

  const { data: programsData } = await supabase
    .from("programs")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  const programs = (programsData as Program[]) ?? [];

  const { data: templatesData } = await supabase
    .from("workout_templates")
    .select("*")
    .order("name");
  const templates = (templatesData as WorkoutTemplate[]) ?? [];

  let workout: Workout | null = null;

  if (params.id !== "new") {
    const { data } = await supabase.from("workouts").select("*").eq("id", params.id).maybeSingle();
    if (!data) notFound();
    workout = data as Workout;
  }

  const defaults = {
    program_id: workout?.program_id ?? searchParams.program ?? programs[0]?.id ?? "crossfit",
    date: workout?.date ?? searchParams.date ?? todayJst(),
  };

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="coach" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-chalk-100">
          {workout ? "WODを編集" : "WODを新規作成"}
        </h1>
        <WorkoutEditor
          programs={programs}
          templates={templates}
          workout={workout}
          defaults={defaults}
          userId={user.id}
          canDelete={profile.role === "admin" || workout?.created_by === user.id}
        />
      </div>
    </main>
  );
}
