"use client";

import { useRouter } from "next/navigation";
import { addDays, formatDateJa } from "@/lib/date";

export default function DateNav({ program, date }: { program: string; date: string }) {
  const router = useRouter();

  function go(d: string) {
    router.push(`/board?program=${program}&date=${d}`);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => go(addDays(date, -1))}
        aria-label="前の日"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-concrete-600 text-chalk-300"
      >
        ‹
      </button>

      <div className="flex flex-1 items-center justify-center gap-2">
        <p className="font-display text-lg tracking-wide text-chalk-100">{formatDateJa(date)}</p>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="rounded-lg border border-concrete-600 bg-concrete-800 px-2 py-1 text-xs text-chalk-300"
          aria-label="日付を選択"
        />
      </div>

      <button
        type="button"
        onClick={() => go(addDays(date, 1))}
        aria-label="次の日"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-concrete-600 text-chalk-300"
      >
        ›
      </button>
    </div>
  );
}
