export const HISTORY_DAYS = [7, 15, 30] as const;
export type HistoryDays = typeof HISTORY_DAYS[number];

export function parseHistoryDays(value: string | null): HistoryDays | null {
  if (value === null) return 7;
  return HISTORY_DAYS.find(days => String(days) === value) ?? null;
}

// Historical charts include today and the preceding N-1 UTC calendar days.
export function historyStart(days: number, now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1));
}
