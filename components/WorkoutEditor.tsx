"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SCORE_TYPE_LABEL } from "@/lib/supabase/types";
import type { Program, ScoreType, Workout, WorkoutTemplate } from "@/lib/supabase/types";

const SCORE_TYPES: ScoreType[] = ["weight", "time", "reps", "rounds_reps", "completion"];

export default function WorkoutEditor({
  programs,
  templates,
  workout,
  defaults,
  userId,
  canDelete,
}: {
  programs: Program[];
  templates: WorkoutTemplate[];
  workout: Workout | null;
  defaults: { program_id: string; date: string };
  userId: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [programId, setProgramId] = useState(defaults.program_id);
  const [date, setDate] = useState(defaults.date);
  const [title, setTitle] = useState(workout?.title ?? "");
  const [body, setBody] = useState(workout?.body ?? "");
  const [scoreType, setScoreType] = useState<ScoreType>(workout?.score_type ?? "time");
  const [scalingRx, setScalingRx] = useState(workout?.scaling_levels.includes("RX") ?? false);
  const [scalingScaled, setScalingScaled] = useState(workout?.scaling_levels.includes("Scaled") ?? false);
  const [sortOrder, setSortOrder] = useState(workout?.sort_order ?? 1);
  const [published, setPublished] = useState(workout?.published ?? false);
  const [countInRanking, setCountInRanking] = useState(workout?.count_in_ranking ?? true);
  const [coachNote, setCoachNote] = useState(workout?.coach_note ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(templateId: string) {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    setTitle(t.title);
    setBody(t.body);
    setScoreType(t.score_type);
    setScalingRx(t.scaling_levels.includes("RX"));
    setScalingScaled(t.scaling_levels.includes("Scaled"));
    setCountInRanking(t.count_in_ranking);
    if (t.program_id) setProgramId(t.program_id);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const scaling_levels = [
      ...(scalingRx ? ["RX"] : []),
      ...(scalingScaled ? ["Scaled"] : []),
    ];

    const payload = {
      program_id: programId,
      date,
      title,
      body,
      score_type: scoreType,
      scaling_levels,
      sort_order: sortOrder,
      published,
      count_in_ranking: countInRanking,
      coach_note: coachNote,
      coach_note_updated_at: coachNote ? new Date().toISOString() : null,
    };

    const result = workout
      ? await supabase.from("workouts").update(payload).eq("id", workout.id)
      : await supabase.from("workouts").insert({ ...payload, created_by: userId });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push(`/coach?program=${programId}&date=${date}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!workout) return;
    setDeleting(true);
    setError(null);

    const { error } = await supabase.from("workouts").delete().eq("id", workout.id);

    setDeleting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/coach?program=${workout.program_id}&date=${workout.date}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-concrete-700 bg-concrete-800 p-5">
      {templates.length > 0 && (
        <div>
          <label className="mb-1 block text-sm text-chalk-300">ひな形から読み込む（任意）</label>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && applyTemplate(e.target.value)}
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
          >
            <option value="">選択しない</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-chalk-300">プログラム</label>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-chalk-300">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="WOD：15min AMRAP"
          className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100 placeholder:text-chalk-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">内容</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-lg border border-concrete-600 bg-concrete-900 p-3 font-mono text-sm text-chalk-100"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-chalk-300">スコアタイプ</label>
          <select
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value as ScoreType)}
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
          >
            {SCORE_TYPES.map((s) => (
              <option key={s} value={s}>
                {SCORE_TYPE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <label className="mb-1 block text-sm text-chalk-300">表示順</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-concrete-600 bg-concrete-900 px-4 py-3 text-chalk-100"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm text-chalk-300">スケーリング区分</p>
        <div className="flex gap-4 text-sm text-chalk-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={scalingRx} onChange={(e) => setScalingRx(e.target.checked)} />
            RX
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={scalingScaled}
              onChange={(e) => setScalingScaled(e.target.checked)}
            />
            Scaled
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">
          コーチより（全員に表示・トレーニングテーマなど）
        </label>
        <textarea
          value={coachNote}
          onChange={(e) => setCoachNote(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-concrete-600 bg-concrete-900 p-3 text-sm text-chalk-100"
        />
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-chalk-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          公開する
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={countInRanking}
            onChange={(e) => setCountInRanking(e.target.checked)}
          />
          結果ボードのランキングに含める
        </label>
      </div>

      {error && <p className="text-sm text-plate-red">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !title || !body}
        className="rounded-xl bg-plate-red py-3 font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
      >
        {saving ? "SAVING…" : "SAVE"}
      </button>

      {workout && canDelete && (
        <div className="mt-2 border-t border-concrete-700 pt-4">
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm text-chalk-500 hover:text-plate-red"
            >
              このWODを削除する
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-plate-red">本当に削除しますか？元に戻せません。</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-plate-red px-3 py-1.5 text-sm font-semibold text-chalk-100 disabled:opacity-50"
              >
                {deleting ? "削除中…" : "削除する"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-sm text-chalk-500"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
