import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';
import { createTrackingProbe, readTrackingProbe, readTrackingReceipt, TRACKER_VERSION } from '@/lib/tracking-health';

type Context = { params: Promise<{ id: string }> };
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function authorize(context: Context) {
  const user = await getAuthenticatedUser();
  if (!user?.id) return { error: json({ error: 'Unauthorized' }, 401) };
  const { id } = await context.params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!project) return { error: json({ error: 'Project not found' }, 404) };
  const limit = await checkRateLimit('tracking-health', user.id, 60);
  if (limit.status !== 200) return { error: json({ error: 'Tracking health temporarily unavailable' }, limit.status) };
  return { id };
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const access = await authorize(context);
    if (access.error) return access.error;
    const id = access.id!;
    const token = request.nextUrl.searchParams.get('testToken');
    if (token && !/^[a-f0-9-]{36}$/.test(token)) return json({ error: 'Invalid test token' }, 400);
    const [event, receipt, probe] = await Promise.all([
      prisma.event.findFirst({ where: { projectId: id }, orderBy: { lastSeenAt: 'desc' }, select: { lastSeenAt: true } }),
      readTrackingReceipt(id), token ? readTrackingProbe(id, token) : null,
    ]);
    const receivedAt = [receipt?.receivedAt, event?.lastSeenAt.toISOString()]
      .filter((value): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
    return json({ status: !receivedAt ? 'waiting' : Date.now() - Date.parse(receivedAt) < 300000 ? 'connected' : 'inactive',
      lastReceivedAt: receivedAt, trackerVersion: receipt?.version || null, latestTrackerVersion: TRACKER_VERSION,
      test: token ? probe ? { status: probe.receivedAt ? 'passed' : 'pending', receivedAt: probe.receivedAt, version: probe.version, expiresAt: probe.expiresAt } : { status: 'expired' } : null });
  } catch (error) { console.error('Tracking health read failed:', error); return json({ error: 'Unable to load tracking health' }, 503); }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    const access = await authorize(context);
    if (access.error) return access.error;
    let body;
    try { body = await readJsonBody(request); } catch { return json({ error: 'Invalid request body' }, 400); }
    if (typeof body.url !== 'string' || body.url.length > 2000) return json({ error: 'Enter a website URL' }, 400);
    let url: URL;
    try { url = new URL(body.url); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { return json({ error: 'Enter an HTTP or HTTPS website URL without credentials' }, 400); }
    const probe = await createTrackingProbe(access.id!);
    url.searchParams.delete('spectr_exclude');
    url.searchParams.delete('spectr_include');
    url.searchParams.set('spectr_test', probe.token);
    return json({ ...probe, testUrl: url.toString() });
  } catch (error) { console.error('Tracking test creation failed:', error); return json({ error: 'Unable to start installation test' }, 503); }
}
