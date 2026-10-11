export const CSV_REPORTS = {
  daily: { label: 'Daily traffic', columns: ['date', 'visitors', 'pageViews', 'bounceRate'] },
  pages: { label: 'Top pages', columns: ['pageUrl', 'visitors', 'pageViews'] },
  countries: { label: 'Countries', columns: ['country', 'visitors', 'percentage'] },
  referrers: { label: 'Top referrers', columns: ['referrer', 'visitors', 'percentage'] },
  sources: { label: 'Sources', columns: ['source', 'visitors', 'percentage'] },
  browsers: { label: 'Browsers', columns: ['browser', 'visitors', 'share'] },
  devices: { label: 'Devices', columns: ['device', 'visitors', 'share'] },
} as const;
export type CsvReport = keyof typeof CSV_REPORTS;
export function isCsvReport(value: string | null): value is CsvReport {
  return value !== null && Object.prototype.hasOwnProperty.call(CSV_REPORTS, value);
}
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Text supplied by tracked websites must not execute as spreadsheet formulas.
  if (typeof value === 'string' && (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function createReportCsv(report: CsvReport, rows: Record<string, unknown>[], metadata: {
  projectId: string; days: number; start: string; end: string;
}) {
  const columns = CSV_REPORTS[report].columns;
  const headers = ['project_id', 'range_days', 'range_start_utc', 'range_end_utc', 'timezone', ...columns];
  const values = rows.map(row => [metadata.projectId, metadata.days, metadata.start, metadata.end, 'UTC', ...columns.map(column => row[column])]);
  // UTF-8 BOM preserves international names when opened directly in Excel.
  return '\uFEFF' + [headers, ...values].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
