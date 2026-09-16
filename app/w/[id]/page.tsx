import { redirect, notFound } from "next/navigation";
import Header from "@/components/Header";
import LogResultForm from "@/components/LogResultForm";
import Leaderboard from "@/components/Leaderboard";
import CoachProxyForm from "@/components/CoachProxyForm";
import { getSessionProfile } from "@/lib/supabase/profile";
import { formatDateJa } from "@/lib/date";
import { SCORE_TYPE_LABEL } from "@/lib/supabase/types";
import type { Profile, ResultCoachNote, ResultPrivateNote, ResultRow, ResultWithProfile, Workout } from "@/lib/supabase/types";

export default async function WorkoutPage({ params }: { params: { id: string } }) {
  const { supabase, user, profile, canManage } = await getSessionProfile();
  if (!user) redirect("/login");

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!workout) notFound();
  const w = workout as Workout;

  const { data: myResult } = await supabase
    .from("results")
    .select("*")
    .eq("workout_id", w.id)
    .eq("user_id", user.id)
    .maybeSingle();

  let coachNote: ResultCoachNote | null = null;
  let privateNote: ResultPrivateNote | null = null;

  if (myResult) {
    const [{ data: cn }, { data: pn }] = await Promise.all([
      supabase
        .from("result_coach_notes")
        .select("*")
        .eq("result_id", (myResult as ResultRow).id)
        .maybeSingle(),
      supabase
        .from("result_private_notes")
        .select("*")
        .eq("result_id", (myResult as ResultRow).id)
        .maybeSingle(),
    ]);
    coachNote = cn as ResultCoachNote | null;
    privateNote = pn as ResultPrivateNote | null;
  }

  let leaderboard: ResultWithProfile[] = [];
  if (w.count_in_ranking) {
    const { data } = await supabase
      .from("results")
      .select("*, profiles(display_name, gender_division, avatar_url)")
      .eq("workout_id", w.id);
    leaderboard = (data as ResultWithProfile[]) ?? [];
  }

  const isCoach = profile?.role === "coach" || canManage;
  let members: Pick<Profile, "id" | "display_name">[] = [];
  if (isCoach) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("role", "member")
      .order("display_name");
    members = data ?? [];
  }

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} canManage={canManage} active="board" />

      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-sm text-chalk-500">{formatDateJa(w.date)}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-wide text-chalk-100">
          {w.title}
        </h1>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-concrete-700 bg-concrete-800 p-4 font-body text-sm text-chalk-100">
          {w.body}
        </pre>

        {w.coach_note && (
          <div className="mt-3 rounded-xl border border-plate-yellow/40 bg-plate-yellow/5 p-4">
            <p className="mb-1 text-xs font-semibold tracking-wide text-plate-yellow">
              コーチより
            </p>
            <pre className="whitespace-pre-wrap font-body text-sm text-chalk-100">{w.coach_note}</pre>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-concrete-600 px-2 py-1 text-chalk-500">
            {SCORE_TYPE_LABEL[w.score_type]}
          </span>
          {!w.count_in_ranking && (
            <span className="rounded-full border border-concrete-600 px-2 py-1 text-chalk-500">
              ランキング対象外
            </span>
          )}
        </div>

        <div className="mt-8">
          <LogResultForm
            workout={w}
            userId={user.id}
            existingResult={myResult as ResultRow | null}
            existingCoachNote={coachNote?.note ?? ""}
            existingPrivateNote={privateNote?.note ?? ""}
            defaultScaling={profile?.default_scaling ?? "RX"}
          />
        </div>

        {isCoach && members.length > 0 && (
          <div className="mt-4">
            <CoachProxyForm workout={w} members={members} />
          </div>
        )}

        {w.count_in_ranking && (
          <div className="mt-10">
            <h2 className="mb-3 font-display text-lg tracking-wide text-chalk-100">結果ボード</h2>
            <Leaderboard scoreType={w.score_type} results={leaderboard} currentUserId={user.id} />
          </div>
        )}
      </div>
    </main>
  );
}
