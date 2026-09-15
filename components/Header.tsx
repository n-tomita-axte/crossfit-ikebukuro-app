import Link from "next/link";
import type { Profile } from "@/lib/supabase/types";
import { signOut } from "@/app/actions";

export default function Header({
  profile,
  active,
}: {
  profile: Profile | null;
  active: "board" | "coach" | "admin" | "settings" | "none";
}) {
  const isCoach = profile?.role === "coach" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-20 border-b border-concrete-700 bg-concrete-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/board" className="font-display text-lg font-semibold tracking-wide text-chalk-100">
          CROSSFIT<span className="text-plate-red">池袋</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/board"
            className={active === "board" ? "text-plate-yellow" : "text-chalk-500 hover:text-chalk-300"}
          >
            ボード
          </Link>
          {isCoach && (
            <Link
              href="/coach"
              className={active === "coach" ? "text-plate-yellow" : "text-chalk-500 hover:text-chalk-300"}
            >
              コーチ
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={active === "admin" ? "text-plate-yellow" : "text-chalk-500 hover:text-chalk-300"}
            >
              管理
            </Link>
          )}
          <Link
            href="/settings"
            className={active === "settings" ? "text-plate-yellow" : "text-chalk-500 hover:text-chalk-300"}
          >
            {profile?.display_name ?? "設定"}
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-chalk-500 hover:text-chalk-300">
              ログアウト
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
