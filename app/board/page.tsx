import { redirect } from "next/navigation";
import Header from "@/components/Header";
import ProgramTabs from "@/components/ProgramTabs";
import DateNav from "@/components/DateNav";
import WorkoutCard from "@/components/WorkoutCard";
import { getSessionProfile } from "@/lib/supabase/profile";
import { todayJst } from "@/lib/date";
import type { Program, Workout } from "@/lib/supabase/types";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { program?: string; date?: string };
}) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  const { data: programsData } = await supabase
    .from("programs")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  const programs = (programsData as Program[]) ?? [];

  const activeProgram = searchParams.program ?? programs[0]?.id ?? "crossfit";
  const date = searchParams.date ?? todayJst();

  const { data: workoutsData } = await supabase
    .from("workouts")
    .select("*")
    .eq("program_id", activeProgram)
    .eq("date", date)
    .order("sort_order");
  const workouts = (workoutsData as Workout[]) ?? [];

  let loggedIds = new Set<string>();
  if (workouts.length > 0) {
    const { data: myResults } = await supabase
      .from("results")
      .select("workout_id")
      .eq("user_id", user.id)
      .in(
        "workout_id",
        workouts.map((w) => w.id)
      );
    loggedIds = new Set((myResults ?? []).map((r: { workout_id: string }) => r.workout_id));
  }

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="board" />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <ProgramTabs programs={programs} active={activeProgram} date={date} />

        <div className="mt-4">
          <DateNav program={activeProgram} date={date} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {workouts.length === 0 ? (
            <p className="mt-10 text-center text-sm text-chalk-500">
              この日はまだWODが公開されていません。
            </p>
          ) : (
            workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} logged={loggedIds.has(w.id)} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
