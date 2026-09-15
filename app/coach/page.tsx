import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import ProgramTabs from "@/components/ProgramTabs";
import DateNav from "@/components/DateNav";
import { getSessionProfile } from "@/lib/supabase/profile";
import { todayJst } from "@/lib/date";
import { SCORE_TYPE_LABEL } from "@/lib/supabase/types";
import type { Program, Workout } from "@/lib/supabase/types";

export default async function CoachPage({
  searchParams,
}: {
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

  const activeProgram = searchParams.program ?? programs[0]?.id ?? "crossfit";
  const date = searchParams.date ?? todayJst();

  const { data: workoutsData } = await supabase
    .from("workouts")
    .select("*")
    .eq("program_id", activeProgram)
    .eq("date", date)
    .order("sort_order");
  const workouts = (workoutsData as Workout[]) ?? [];

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="coach" />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl tracking-wide text-chalk-100">コーチ管理</h1>
          <Link href="/coach/handovers" className="text-sm text-plate-yellow">
            申し送り →
          </Link>
        </div>

        <div className="mt-6">
          <ProgramTabs programs={programs} active={activeProgram} date={date} />
        </div>
        <div className="mt-4">
          <DateNav program={activeProgram} date={date} />
        </div>

        <Link
          href={`/coach/workouts/new?program=${activeProgram}&date=${date}`}
          className="mt-6 block w-full rounded-xl border border-dashed border-concrete-600 py-4 text-center text-sm font-semibold text-chalk-300 hover:border-plate-yellow hover:text-plate-yellow"
        >
          + この日にWODを追加
        </Link>

        <div className="mt-6 flex flex-col gap-3">
          {workouts.map((w) => (
            <Link
              key={w.id}
              href={`/coach/workouts/${w.id}`}
              className="block rounded-xl border border-concrete-700 bg-concrete-800 p-4 hover:border-concrete-600"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg tracking-wide text-chalk-100">{w.title}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    w.published
                      ? "border-plate-green text-plate-green"
                      : "border-plate-yellow text-plate-yellow"
                  }`}
                >
                  {w.published ? "公開中" : "下書き"}
                </span>
              </div>
              <p className="mt-1 text-xs text-chalk-500">{SCORE_TYPE_LABEL[w.score_type]}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
