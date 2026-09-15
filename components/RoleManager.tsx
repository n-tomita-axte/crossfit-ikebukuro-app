"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/supabase/types";

const ROLES: Role[] = ["member", "coach", "admin"];
const ROLE_LABEL: Record<Role, string> = { member: "会員", coach: "コーチ", admin: "管理者" };

export default function RoleManager({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(targetId: string, newRole: Role) {
    setPendingId(targetId);
    setError(null);

    const { error } = await supabase.rpc("admin_set_role", {
      target: targetId,
      new_role: newRole,
    });

    setPendingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-plate-red">{error}</p>}
      {profiles.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-xl border border-concrete-700 bg-concrete-800 p-4"
        >
          <div>
            <p className="text-chalk-100">{p.display_name}</p>
            {p.id === currentUserId && <p className="text-xs text-chalk-500">あなた</p>}
          </div>
          <select
            value={p.role}
            disabled={pendingId === p.id || p.id === currentUserId}
            onChange={(e) => changeRole(p.id, e.target.value as Role)}
            className="rounded-lg border border-concrete-600 bg-concrete-900 px-3 py-2 text-sm text-chalk-100 disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
