"use client";

import { useMemo, useState } from "react";
import { formatSecondsAsClock } from "@/lib/date";
import type { GenderDivision, ResultWithProfile, ScoreType } from "@/lib/supabase/types";

function scoreLabel(r: ResultWithProfile, scoreType: ScoreType): string {
  if (scoreType === "completion") return r.completed ? "完了" : "未完了";
  if (r.score_value == null) return "—";
  if (scoreType === "time") return formatSecondsAsClock(r.score_value);
  if (scoreType === "rounds_reps") {
    return `${r.score_value}ラウンド${r.score_secondary ? ` + ${r.score_secondary}` : ""}`;
  }
  if (scoreType === "weight") return `${r.score_value} kg`;
  return `${r.score_value}`;
}

function sortResults(results: ResultWithProfile[], scoreType: ScoreType): ResultWithProfile[] {
  const scored = results.filter((r) =>
    scoreType === "completion" ? r.completed === true : r.score_value != null
  );

  const sorted = [...scored].sort((a, b) => {
    if (scoreType === "time") return (a.score_value ?? Infinity) - (b.score_value ?? Infinity);
    if (scoreType === "rounds_reps") {
      const roundsDiff = (b.score_value ?? 0) - (a.score_value ?? 0);
      if (roundsDiff !== 0) return roundsDiff;
      return (b.score_secondary ?? 0) - (a.score_secondary ?? 0);
    }
    if (scoreType === "completion") {
      return (a.profiles?.display_name ?? "").localeCompare(b.profiles?.display_name ?? "");
    }
    return (b.score_value ?? 0) - (a.score_value ?? 0);
  });

  return sorted;
}

const FILTERS: { key: "all" | GenderDivision; label: string }[] = [
  { key: "all", label: "全体" },
  { key: "men", label: "男性" },
  { key: "women", label: "女性" },
];

export default function Leaderboard({
  scoreType,
  results,
  currentUserId,
}: {
  scoreType: ScoreType;
  results: ResultWithProfile[];
  currentUserId: string;
}) {
  const [filter, setFilter] = useState<"all" | GenderDivision>("all");

  const filtered = useMemo(() => {
    const base = filter === "all" ? results : results.filter((r) => r.profiles?.gender_division === filter);
    return sortResults(base, scoreType);
  }, [results, filter, scoreType]);

  if (results.length === 0) {
    return <p className="text-sm text-chalk-500">まだ記録がありません。</p>;
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key ?? "all"}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filter === f.key
                ? "border-plate-yellow text-plate-yellow"
                : "border-concrete-600 text-chalk-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-chalk-500">該当する記録がありません。</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {filtered.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-2 text-sm ${
                r.user_id === currentUserId
                  ? "border-plate-yellow bg-plate-yellow/5"
                  : "border-concrete-700 bg-concrete-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-right font-mono text-chalk-500">{i + 1}</span>
                <span className="text-chalk-100">{r.profiles?.display_name ?? "不明"}</span>
                {r.scaling && (
                  <span className="rounded-full border border-concrete-600 px-2 py-0.5 text-xs text-chalk-500">
                    {r.scaling}
                  </span>
                )}
              </div>
              <span className="font-mono text-chalk-100">{scoreLabel(r, scoreType)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
