"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/supabase/types";

const ROLES: Role[] = ["member", "coach"];
const ROLE_LABEL: Record<Role, string> = { member: "会員", coach: "コーチ" };

export default function RoleManager({
  profiles,
  managerIds,
  currentUserId,
}: {
  profiles: Profile[];
  managerIds: string[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<Set<string>>(new Set(managerIds));

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

  async function toggleManage(targetId: string, grant: boolean) {
    setPendingId(targetId);
    setError(null);

    const { error } = await supabase.rpc(
      grant ? "admin_grant_permission" : "admin_revoke_permission",
      { target: targetId, key: "manage_roles" }
    );

    setPendingId(null);
    if (error) {
      setError(error.message);
      return;
    }

    setManagers((prev) => {
      const next = new Set(prev);
      if (grant) next.add(targetId);
      else next.delete(targetId);
      return next;
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-plate-red">{error}</p>}
      {profiles.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-concrete-700 bg-concrete-800 p-4"
        >
          <div>
            <p className="text-chalk-100">{p.display_name}</p>
            {p.id === currentUserId && <p className="text-xs text-chalk-500">あなた</p>}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={p.role}
              disabled={pendingId === p.id}
              onChange={(e) => changeRole(p.id, e.target.value as Role)}
              className="rounded-lg border border-concrete-600 bg-concrete-900 px-3 py-2 text-sm text-chalk-100 disabled:opacity-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-chalk-300">
              <input
                type="checkbox"
                checked={managers.has(p.id)}
                disabled={pendingId === p.id || (p.id === currentUserId && managers.has(p.id))}
                onChange={(e) => toggleManage(p.id, e.target.checked)}
              />
              管理操作を許可
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
