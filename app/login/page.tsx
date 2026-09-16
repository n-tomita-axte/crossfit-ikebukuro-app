"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordAuthForm from "@/components/PasswordAuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const linkExpired = searchParams.get("error") === "auth";

  const [authMethod, setAuthMethod] = useState<"magic" | "password">("magic");

  // --- magic link state ---
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-1 text-center font-display text-3xl font-semibold tracking-wide text-chalk-100">
          CROSSFIT<span className="text-plate-red">池袋</span>
        </p>
        <p className="mb-8 text-center text-sm text-chalk-500">
          会員向け WOD記録アプリ
        </p>

        {linkExpired && (
          <p className="mb-4 rounded-lg border border-plate-red/40 bg-plate-red/10 p-3 text-center text-sm text-plate-red">
            リンクの有効期限が切れているか、既に使用されています。もう一度送信してください。
          </p>
        )}

        {authMethod === "magic" ? (
          sent ? (
            <div className="rounded-xl border border-plate-green/40 bg-plate-green/10 p-4 text-center">
              <p className="text-sm text-chalk-100">
                <span className="font-semibold text-plate-green">{email}</span> 宛にログイン用のリンクを送信しました。
              </p>
              <p className="mt-2 text-xs text-chalk-500">
                メールを開いて「ログインする」リンクをタップしてください。届かない場合は迷惑メールフォルダもご確認ください。
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-chalk-500 hover:text-chalk-300"
              >
                別のメールアドレスで送り直す
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-concrete-600 bg-concrete-800 px-4 py-3 text-chalk-100 placeholder:text-chalk-500 focus:border-plate-yellow focus:outline-none"
              />

              {error && <p className="text-sm text-plate-red">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="mt-2 rounded-xl bg-plate-red py-3 font-display text-base font-semibold tracking-wide text-chalk-100 disabled:opacity-50"
              >
                {sending ? "送信中…" : "ログインリンクを送信"}
              </button>
              <p className="text-center text-xs text-chalk-500">
                パスワードは不要です。届いたメールのリンクからログインできます。
              </p>
            </form>
          )
        ) : (
          <PasswordAuthForm />
        )}

        <button
          type="button"
          onClick={() => {
            setAuthMethod(authMethod === "magic" ? "password" : "magic");
            setSent(false);
            setError(null);
          }}
          className="mt-6 w-full text-center text-sm text-chalk-500 hover:text-chalk-300"
        >
          {authMethod === "magic" ? "パスワードでログインする" : "メールのリンクでログインする"}
        </button>
      </div>
    </main>
  );
}
