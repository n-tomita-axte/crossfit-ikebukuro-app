import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function getSessionProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null as Profile | null, canManage: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: permission } = await supabase
    .from("permissions")
    .select("permission_key")
    .eq("user_id", user.id)
    .eq("permission_key", "manage_roles")
    .maybeSingle();

  return {
    supabase,
    user,
    profile: (profile as Profile) ?? null,
    canManage: !!permission,
  };
}
