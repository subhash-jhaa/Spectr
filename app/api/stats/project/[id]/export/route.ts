import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { EventQueries } from '@/queries';
import { resolveHistory, parseHistorySelection } from '@/lib/history-range';
import { checkRateLimit } from '@/lib/request-limits';
import { createReportCsv, isCsvReport } from '@/lib/csv-export';

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers });
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) return error('Unauthorized', 401);
    const selection = parseHistorySelection(request.nextUrl.searchParams);
    const report = request.nextUrl.searchParams.get('report') ?? 'daily';
    if (selection === null || !isCsvReport(report)) return error('Choose a supported report and date range', 400);
    if ([...request.nextUrl.searchParams.keys()].some(key => !['days', 'report', 'start', 'end'].includes(key))) return error('Unsupported export filter', 400);
    const { id } = await context.params;
    const project = await prisma.project.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!project) return error('Project not found', 404);
    const limit = await checkRateLimit('csv-export', user.id, 10);
    if (limit.status !== 200) return NextResponse.json({ error: limit.status === 429 ? 'Too many exports. Please try again later.' : 'Exports temporarily unavailable' },
      { status: limit.status, headers: { ...headers, 'Retry-After': String(limit.retryAfter) } });
    const now = new Date();
    const { startDate, endDate, days } = resolveHistory(selection, now);
    const query = {
      daily: () => EventQueries.getDailyStats(id, selection),
      pages: () => EventQueries.getPageStats(id, selection),
      countries: () => EventQueries.getCountryStats(id, selection),
      referrers: () => EventQueries.getReferrerStats(id, selection),
      sources: () => EventQueries.getSourceStats(id, selection),
      browsers: () => EventQueries.getBrowserStats(id, selection),
      devices: () => EventQueries.getDeviceStats(id, selection),
    }[report];
    const result = await query();
    if (!result.success || !Array.isArray(result.data)) return error('Unable to generate this report', 500);
    if (result.data.length > 10000) return error('Report is too large. Choose a shorter date range.', 413);
    const start = startDate.toISOString().slice(0, 10);
    const end = new Date(endDate.getTime() - 1).toISOString().slice(0, 10);
    const csv = createReportCsv(report, result.data as unknown as Record<string, unknown>[], { projectId: id, days, start, end });
    if (Buffer.byteLength(csv, 'utf8') > 10 * 1024 * 1024) return error('Report is too large. Choose a shorter date range.', 413);
    return new NextResponse(csv, { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="spectr-${report}-${days}days-${start}-to-${end}.csv"` } });
  } catch (cause) { console.error('CSV export failed:', cause); return error('Unable to export report. Please retry.', 500); }
}
