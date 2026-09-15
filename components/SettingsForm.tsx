"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export default function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [gender, setGender] = useState<string>(profile?.gender_division ?? "");
  const [defaultScaling, setDefaultScaling] = useState(profile?.default_scaling ?? "RX");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        gender_division: gender === "" ? null : gender,
        default_scaling: defaultScaling,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    // router.refresh() re-fetches this page segment from the server, which
    // remounts this client component and would otherwise wipe the "saved"
    // message before it's ever seen. Give it a moment to display first.
    setTimeout(() => router.refresh(), 1200);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-chalk-300">表示名</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 focus:border-plate-yellow focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">性別区分（結果ボードの絞り込みに使用）</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-lg border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 focus:border-plate-yellow focus:outline-none"
        >
          <option value="">回答しない</option>
          <option value="men">男性</option>
          <option value="women">女性</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-chalk-300">既定のスケーリング</label>
        <select
          value={defaultScaling}
          onChange={(e) => setDefaultScaling(e.target.value)}
          className="w-full rounded-lg border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 focus:border-plate-yellow focus:outline-none"
        >
          <option value="RX">RX</option>
          <option value="Scaled">Scaled</option>
        </select>
      </div>

      {error && <p className="text-sm text-plate-red">{error}</p>}
      {saved && !error && <p className="text-sm text-plate-green">保存しました。</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-plate-red py-3 font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
      >
        {saving ? "SAVING…" : "SAVE"}
      </button>
    </div>
  );
}
