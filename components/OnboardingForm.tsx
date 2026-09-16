"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingForm({
  userId,
  defaultDisplayName,
}: {
  userId: string;
  defaultDisplayName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  // If the default is the auto-generated email-prefix name, start the field
  // empty so the person types their real name rather than keeping it by accident.
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed === "") {
      setError("表示名を入力してください。");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: trimmed,
        gender_division: gender === "" ? null : gender,
        onboarded: true,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/board");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm text-chalk-300">表示名</label>
        <input
          required
          autoFocus
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={defaultDisplayName || "山田 太郎"}
          className="w-full rounded-xl border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
        />
        <p className="mt-1 text-xs text-chalk-500">
          結果ボードやコーチとのやり取りで、この名前が表示されます。
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">
          性別区分（任意・結果ボードの絞り込みに使用）
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-xl border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 focus:border-plate-yellow focus:outline-none"
        >
          <option value="">回答しない</option>
          <option value="men">男性</option>
          <option value="women">女性</option>
        </select>
      </div>

      {error && <p className="text-sm text-plate-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-xl bg-plate-red py-3 font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
      >
        {saving ? "登録中…" : "はじめる"}
      </button>
    </form>
  );
}
