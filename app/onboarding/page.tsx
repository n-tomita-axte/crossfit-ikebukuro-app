import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/profile";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  // Already onboarded — nothing to do here.
  if (profile?.onboarded) {
    redirect("/board");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-1 text-center font-display text-2xl font-semibold tracking-wide text-chalk-100">
          ようこそ、CROSSFIT<span className="text-plate-red">池袋</span>へ
        </p>
        <p className="mb-8 text-center text-sm text-chalk-500">
          はじめに、表示名を登録してください
        </p>
        <OnboardingForm
          userId={user.id}
          defaultDisplayName={profile?.display_name ?? ""}
        />
      </div>
    </main>
  );
}
