import { redirect } from "next/navigation";
import Header from "@/components/Header";
import SettingsForm from "@/components/SettingsForm";
import { getSessionProfile } from "@/lib/supabase/profile";

export default async function SettingsPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-concrete-900 pb-16">
      <Header profile={profile} active="settings" />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-chalk-100">プロフィール設定</h1>
        <SettingsForm profile={profile} />
      </div>
    </main>
  );
}
