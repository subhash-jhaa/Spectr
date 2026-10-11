export const HISTORY_DAYS = [7, 15, 30] as const;
export type HistoryDays = typeof HISTORY_DAYS[number];
export type CustomRange = { start: string; end: string };
export type HistorySelection = number | { startDate: Date; endDate: Date; days: number };

export function parseHistoryDays(value: string | null): HistoryDays | null {
  if (value === null) return 7;
  return HISTORY_DAYS.find(days => String(days) === value) ?? null;
}

// Historical charts include today and the preceding N-1 UTC calendar days.
export function historyStart(days: number, now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1));
}
export function resolveHistory(selection: HistorySelection, now = new Date()) {
  if (typeof selection !== 'number') return selection;
  return { startDate: historyStart(selection, now), endDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)), days: selection };
}
export function parseHistorySelection(params: URLSearchParams, now = new Date()): HistorySelection | null {
  const start = params.get('start'); const end = params.get('end');
  if (start === null && end === null) return parseHistoryDays(params.get('days'));
  if (!start || !end || params.has('days')) return null;
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(start) || !validDate(end) || start < '2000-01-01' || end > now.toISOString().slice(0, 10)) return null;
  const startDate = new Date(start); const endDate = new Date(Date.parse(end) + 86400000);
  const days = (endDate.getTime() - startDate.getTime()) / 86400000;
  return days >= 1 && days <= 366 ? { startDate, endDate, days } : null;
}
