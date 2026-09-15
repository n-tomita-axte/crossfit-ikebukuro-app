"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Handover } from "@/lib/supabase/types";

export default function HandoverBoard({
  handovers,
  nameById,
  userId,
}: {
  handovers: Handover[];
  nameById: Record<string, string>;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addHandover() {
    if (body.trim() === "") return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("handovers").insert({ body, author_id: userId });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setBody("");
    router.refresh();
  }

  async function toggleDone(h: Handover) {
    const { error } = await supabase
      .from("handovers")
      .update(
        h.done
          ? { done: false, done_by: null, done_at: null }
          : { done: true, done_by: userId, done_at: new Date().toISOString() }
      )
      .eq("id", h.id);

    if (!error) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-concrete-700 bg-concrete-800 p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="次のコーチへの申し送り事項"
          className="w-full resize-none rounded-lg border border-concrete-600 bg-concrete-900 p-3 text-sm text-chalk-100 placeholder:text-chalk-500"
        />
        {error && <p className="mt-2 text-sm text-plate-red">{error}</p>}
        <button
          type="button"
          onClick={addHandover}
          disabled={saving}
          className="mt-3 rounded-lg bg-plate-red px-4 py-2 text-sm font-semibold text-chalk-100 disabled:opacity-50"
        >
          追加
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {handovers.map((h) => (
          <li
            key={h.id}
            className={`rounded-xl border p-4 ${
              h.done ? "border-concrete-700 bg-concrete-800/50 opacity-60" : "border-concrete-700 bg-concrete-800"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm text-chalk-100">{h.body}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-chalk-500">
              <span>
                {nameById[h.author_id ?? ""] ?? "不明"} ・{" "}
                {new Date(h.created_at).toLocaleString("ja-JP")}
              </span>
              <button
                type="button"
                onClick={() => toggleDone(h)}
                className={h.done ? "text-plate-yellow" : "text-plate-green"}
              >
                {h.done ? "未対応に戻す" : "対応済みにする"}
              </button>
            </div>
          </li>
        ))}
        {handovers.length === 0 && (
          <p className="text-sm text-chalk-500">申し送りはまだありません。</p>
        )}
      </ul>
    </div>
  );
}
