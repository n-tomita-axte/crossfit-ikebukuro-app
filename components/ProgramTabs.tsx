import Link from "next/link";
import type { Program } from "@/lib/supabase/types";

export default function ProgramTabs({
  programs,
  active,
  date,
}: {
  programs: Program[];
  active: string;
  date: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {programs.map((p) => (
        <Link
          key={p.id}
          href={`/board?program=${p.id}&date=${date}`}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide ${
            p.id === active
              ? "border-plate-yellow bg-plate-yellow/10 text-plate-yellow"
              : "border-concrete-600 text-chalk-500"
          }`}
        >
          {p.name}
        </Link>
      ))}
    </div>
  );
}
