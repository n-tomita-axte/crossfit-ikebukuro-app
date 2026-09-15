"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatSecondsAsClock, parseClockToSeconds } from "@/lib/date";
import type { ResultRow, Workout } from "@/lib/supabase/types";

export default function LogResultForm({
  workout,
  userId,
  existingResult,
  existingCoachNote,
  existingPrivateNote,
  defaultScaling,
}: {
  workout: Workout;
  userId: string;
  existingResult: ResultRow | null;
  existingCoachNote: string;
  existingPrivateNote: string;
  defaultScaling: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [weightOrReps, setWeightOrReps] = useState(
    existingResult?.score_value != null ? String(existingResult.score_value) : ""
  );
  const [clock, setClock] = useState(
    existingResult?.score_value != null ? formatSecondsAsClock(existingResult.score_value) : ""
  );
  const [rounds, setRounds] = useState(
    existingResult?.score_value != null ? String(existingResult.score_value) : ""
  );
  const [extraReps, setExtraReps] = useState(
    existingResult?.score_secondary != null ? String(existingResult.score_secondary) : ""
  );
  const [completed, setCompleted] = useState<boolean>(existingResult?.completed ?? false);
  const [scaling, setScaling] = useState<string>(
    existingResult?.scaling ?? (workout.scaling_levels[0] ? defaultScaling : "")
  );
  const [coachNote, setCoachNote] = useState(existingCoachNote);
  const [privateNote, setPrivateNote] = useState(existingPrivateNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
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

    const { data: resultRow, error: resultError } = await supabase
      .from("results")
      .upsert(
        {
          workout_id: workout.id,
          user_id: userId,
          score_value,
          score_secondary,
          completed: workout.score_type === "completion" ? completed : null,
          scaling: workout.scaling_levels.length > 0 ? scaling : null,
          logged_date: workout.date,
        },
        { onConflict: "workout_id,user_id" }
      )
      .select("id")
      .single();

    if (resultError || !resultRow) {
      setSaving(false);
      setError(resultError?.message ?? "保存に失敗しました");
      return;
    }

    const resultId = resultRow.id as string;

    const notePromises = [];
    if (coachNote.trim() !== "") {
      notePromises.push(
        supabase
          .from("result_coach_notes")
          .upsert(
            { result_id: resultId, user_id: userId, note: coachNote },
            { onConflict: "result_id" }
          )
      );
    }
    if (privateNote.trim() !== "") {
      notePromises.push(
        supabase
          .from("result_private_notes")
          .upsert(
            { result_id: resultId, user_id: userId, note: privateNote },
            { onConflict: "result_id" }
          )
      );
    }

    const noteResults = await Promise.all(notePromises);
    const noteError = noteResults.find((r) => r?.error)?.error;

    setSaving(false);

    if (noteError) {
      setError(noteError.message);
      return;
    }

    setSaved(true);
    // Delay so the "保存しました。" message is actually visible before this
    // segment remounts and wipes local state (see SettingsForm for the same fix).
    setTimeout(() => router.refresh(), 1200);
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-concrete-700 bg-concrete-800 p-5">
      <p className="font-display text-base tracking-wide text-chalk-100">記録する</p>

      {workout.score_type === "weight" && (
        <div>
          <label className="mb-1 block text-sm text-chalk-300">重量 (kg)</label>
          <input
            inputMode="decimal"
            value={weightOrReps}
            onChange={(e) => setWeightOrReps(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-lg text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
          />
        </div>
      )}

      {workout.score_type === "reps" && (
        <div>
          <label className="mb-1 block text-sm text-chalk-300">レップ数 / カロリーなど</label>
          <input
            inputMode="numeric"
            value={weightOrReps}
            onChange={(e) => setWeightOrReps(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-lg text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
          />
        </div>
      )}

      {workout.score_type === "time" && (
        <div>
          <label className="mb-1 block text-sm text-chalk-300">タイム (分:秒)</label>
          <input
            value={clock}
            onChange={(e) => setClock(e.target.value)}
            placeholder="12:34"
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-lg text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
          />
        </div>
      )}

      {workout.score_type === "rounds_reps" && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-chalk-300">ラウンド</label>
            <input
              inputMode="numeric"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-lg text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm text-chalk-300">+ レップ</label>
            <input
              inputMode="numeric"
              value={extraReps}
              onChange={(e) => setExtraReps(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 font-mono text-lg text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
            />
          </div>
        </div>
      )}

      {workout.score_type === "completion" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCompleted(true)}
            className={`rounded-full border py-3 text-center font-display tracking-wide ${
              completed
                ? "border-plate-green bg-plate-green/15 text-plate-green"
                : "border-concrete-600 text-chalk-300"
            }`}
          >
            {completed && "✓ "}DONE
          </button>
          <button
            type="button"
            onClick={() => setCompleted(false)}
            className={`rounded-full border py-3 text-center font-display tracking-wide ${
              !completed
                ? "border-plate-red bg-plate-red/15 text-plate-red"
                : "border-concrete-600 text-chalk-300"
            }`}
          >
            {!completed && "✓ "}未完了
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
              className={`rounded-full border py-3 text-center font-display tracking-wide ${
                scaling === level
                  ? "border-plate-red bg-plate-red/15 text-plate-red"
                  : "border-concrete-600 text-chalk-300"
              }`}
            >
              {scaling === level && "✓ "}
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold text-chalk-300">コーチへのメモ</label>
        <p className="mb-2 text-xs text-chalk-500">あなたとコーチだけが見られます。</p>
        <textarea
          value={coachNote}
          onChange={(e) => setCoachNote(e.target.value)}
          rows={3}
          placeholder="フォームの確認をお願いしたい点など"
          className="w-full resize-none rounded-lg border border-concrete-600 bg-concrete-900 p-3 text-sm text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-chalk-300">自分だけのメモ</label>
        <p className="mb-2 text-xs text-chalk-500">あなた以外は見られません。</p>
        <textarea
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          rows={3}
          placeholder="体調や感想など"
          className="w-full resize-none rounded-lg border border-concrete-600 bg-concrete-900 p-3 text-sm text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-plate-red">{error}</p>}
      {saved && !error && <p className="text-sm text-plate-green">保存しました。</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-plate-red py-3 text-center font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
      >
        {saving ? "SAVING…" : "SAVE"}
      </button>
    </div>
  );
}
