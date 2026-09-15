"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatSecondsAsClock, parseClockToSeconds } from "@/lib/date";
import type { Profile, ResultRow, Workout } from "@/lib/supabase/types";

export default function CoachProxyForm({
  workout,
  members,
}: {
  workout: Workout;
  members: Pick<Profile, "id" | "display_name">[];
}) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<ResultRow | null>(null);

  const [weightOrReps, setWeightOrReps] = useState("");
  const [clock, setClock] = useState("");
  const [rounds, setRounds] = useState("");
  const [extraReps, setExtraReps] = useState("");
  const [completed, setCompleted] = useState(false);
  const [scaling, setScaling] = useState(workout.scaling_levels[0] ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setExisting(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSaved(false);
    supabase
      .from("results")
      .select("*")
      .eq("workout_id", workout.id)
      .eq("user_id", memberId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const r = data as ResultRow | null;
        setExisting(r);
        setWeightOrReps(r?.score_value != null ? String(r.score_value) : "");
        setClock(r?.score_value != null ? formatSecondsAsClock(r.score_value) : "");
        setRounds(r?.score_value != null ? String(r.score_value) : "");
        setExtraReps(r?.score_secondary != null ? String(r.score_secondary) : "");
        setCompleted(r?.completed ?? false);
        setScaling(r?.scaling ?? workout.scaling_levels[0] ?? "");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  async function handleSave() {
    if (!memberId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    let score_value: number | null = null;
    let score_secondary: number | null = null;

    if (workout.score_type === "weight" || workout.score_type === "reps") {
      score_value = weightOrReps === "" ? null : Number(weightOrReps);
    } else if (workout.score_type === "time") {
      score_value = parseClockToSeconds(clock);
    } else if (workout.score_type === "rounds_reps") {
      score_value = rounds === "" ? null : Number(rounds);
      score_secondary = extraReps === "" ? null : Number(extraReps);
    }

    const { error } = await supabase.from("results").upsert(
      {
        workout_id: workout.id,
        user_id: memberId,
        score_value,
        score_secondary,
        completed: workout.score_type === "completion" ? completed : null,
        scaling: workout.scaling_levels.length > 0 ? scaling : null,
        logged_date: workout.date,
      },
      { onConflict: "workout_id,user_id" }
    );

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-dashed border-concrete-600 px-4 py-2 text-xs font-semibold text-chalk-500 hover:border-plate-yellow hover:text-plate-yellow"
      >
        コーチ用：会員の代わりに記録する
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-plate-blue/40 bg-plate-blue/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-sm tracking-wide text-plate-blue">代理入力（コーチ用）</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-chalk-500">
          閉じる
        </button>
      </div>

      <p className="mb-3 text-xs text-chalk-500">
        スコアとスケーリングのみ代理入力できます。コーチへのメモ／自分だけのメモは本人しか書き込めない設定のため、ここには含まれません。
      </p>

      <select
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
        className="mb-4 w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
      >
        <option value="">会員を選択…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
          </option>
        ))}
      </select>

      {memberId && loading && <p className="text-sm text-chalk-500">読み込み中…</p>}

      {memberId && !loading && (
        <div className="flex flex-col gap-4">
          {existing && (
            <p className="text-xs text-plate-yellow">この会員は既に記録済みです。上書きされます。</p>
          )}

          {(workout.score_type === "weight" || workout.score_type === "reps") && (
            <input
              inputMode="decimal"
              value={weightOrReps}
              onChange={(e) => setWeightOrReps(e.target.value)}
              placeholder={workout.score_type === "weight" ? "重量 (kg)" : "レップ数"}
              className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-chalk-100 placeholder:text-chalk-500"
            />
          )}

          {workout.score_type === "time" && (
            <input
              value={clock}
              onChange={(e) => setClock(e.target.value)}
              placeholder="タイム 分:秒（例 12:34）"
              className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-chalk-100 placeholder:text-chalk-500"
            />
          )}

          {workout.score_type === "rounds_reps" && (
            <div className="flex gap-3">
              <input
                inputMode="numeric"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                placeholder="ラウンド"
                className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-chalk-100 placeholder:text-chalk-500"
              />
              <input
                inputMode="numeric"
                value={extraReps}
                onChange={(e) => setExtraReps(e.target.value)}
                placeholder="+ レップ"
                className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-chalk-100 placeholder:text-chalk-500"
              />
            </div>
          )}

          {workout.score_type === "completion" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompleted(true)}
                className={`rounded-full border py-2 text-sm ${
                  completed ? "border-plate-green text-plate-green" : "border-concrete-600 text-chalk-300"
                }`}
              >
                DONE
              </button>
              <button
                type="button"
                onClick={() => setCompleted(false)}
                className={`rounded-full border py-2 text-sm ${
                  !completed ? "border-plate-red text-plate-red" : "border-concrete-600 text-chalk-300"
                }`}
              >
                未完了
              </button>
            </div>
          )}

          {workout.scaling_levels.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {workout.scaling_levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setScaling(level)}
                  className={`rounded-full border py-2 text-sm ${
                    scaling === level
                      ? "border-plate-red text-plate-red"
                      : "border-concrete-600 text-chalk-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-plate-red">{error}</p>}
          {saved && !error && <p className="text-sm text-plate-green">保存しました。</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-plate-blue py-2 text-sm font-semibold text-chalk-100 disabled:opacity-50"
          >
            {saving ? "SAVING…" : "この会員の記録を保存"}
          </button>
        </div>
      )}
    </div>
  );
}
