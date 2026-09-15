const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Today's date as YYYY-MM-DD in JST, regardless of server timezone. */
export function todayJst(): string {
  const now = new Date(Date.now() + JST_OFFSET_MS);
  return now.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateJa(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  const wd = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日 (${WEEKDAYS_JA[wd]})`;
}

export function formatSecondsAsClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Parses "mm:ss" or a bare number of seconds into seconds. */
export function parseClockToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":");
    const mins = Number(m);
    const secs = Number(s);
    if (Number.isNaN(mins) || Number.isNaN(secs)) return null;
    return mins * 60 + secs;
  }
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}
