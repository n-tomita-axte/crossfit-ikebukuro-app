"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordAuthForm() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
        />

        {error && <p className="text-sm text-plate-red">{error}</p>}
        {info && <p className="text-sm text-plate-green">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-plate-red py-3 font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
        >
          {loading ? "処理中…" : mode === "signin" ? "ログイン" : "アカウント作成"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-center text-sm text-chalk-500 hover:text-chalk-300"
      >
        {mode === "signin" ? "アカウントを作成する" : "すでにアカウントをお持ちの方はこちら"}
      </button>
    </div>
  );
}
