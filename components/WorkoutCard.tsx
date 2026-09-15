import Link from "next/link";
import type { Workout } from "@/lib/supabase/types";
import { SCORE_TYPE_LABEL } from "@/lib/supabase/types";

export default function WorkoutCard({
  workout,
  logged,
}: {
  workout: Workout;
  logged: boolean;
}) {
  return (
    <Link
      href={`/w/${workout.id}`}
      className="block rounded-xl border border-concrete-700 bg-concrete-800 p-4 transition-colors hover:border-concrete-600"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg tracking-wide text-chalk-100">{workout.title}</p>
        {logged && (
          <span className="shrink-0 rounded-full border border-plate-green px-2 py-0.5 text-xs font-semibold text-plate-green">
            記録済み
          </span>
        )}
      </div>
      <pre className="mt-2 line-clamp-4 whitespace-pre-wrap font-body text-sm text-chalk-300">
        {workout.body}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-concrete-600 px-2 py-1 text-chalk-500">
          {SCORE_TYPE_LABEL[workout.score_type]}
        </span>
        {workout.scaling_levels.map((s) => (
          <span key={s} className="rounded-full border border-plate-blue px-2 py-1 text-plate-blue">
            {s}
          </span>
        ))}
        {!workout.count_in_ranking && (
          <span className="rounded-full border border-concrete-600 px-2 py-1 text-chalk-500">
            ランキング対象外
          </span>
        )}
      </div>
    </Link>
  );
}
