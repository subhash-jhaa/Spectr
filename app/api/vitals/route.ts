import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getP75Vitals } from '@/lib/web-vitals-analytics';
import { getAuthenticatedUser } from '@/lib/api-utils';
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST — called by track.js via sendBeacon / fetch on page lifecycle events
export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit('vitals', getClientIP(req));
    if (limit.status !== 200) return NextResponse.json({ error: limit.status === 429 ? 'Too many requests' : 'Vitals temporarily unavailable' }, { status: limit.status, headers: { ...corsHeaders, 'Retry-After': String(limit.retryAfter) } });

    let body;
    try { body = await readJsonBody(req); }
    catch (error) { return NextResponse.json({ error: 'Invalid request body' }, { status: error instanceof Error && error.message === 'Request body too large' ? 413 : 400, headers: corsHeaders }); }

    const { projectId, lcp, inp, cls, pageUrl, device, sampleId } = body;

    if (typeof projectId !== 'string' || !projectId || projectId.length > 128 || typeof pageUrl !== 'string' || !pageUrl || pageUrl.length > 2000 || (sampleId !== undefined && (typeof sampleId !== 'string' || !/^[a-zA-Z0-9_\-.:]{6,128}$/.test(sampleId)))) {
      return NextResponse.json(
        { error: 'projectId and pageUrl required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Quick verification that project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    let cleanPageUrl;
    try { const url = new URL(pageUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); cleanPageUrl = url.origin + url.pathname; }
    catch { return NextResponse.json({ error: 'Invalid page URL' }, { status: 400, headers: corsHeaders }); }
    const metric = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
    const data = {
        projectId,
        sampleId: typeof sampleId === 'string' ? sampleId : null,
        lcp: metric(lcp),
        inp: metric(inp),
        cls: metric(cls),
        pageUrl: cleanPageUrl,
        device: device ? String(device).slice(0, 50) : null,
    };
    if (typeof sampleId === 'string') {
      await prisma.webVital.upsert({ where: { projectId_sampleId: { projectId, sampleId } }, create: data, update: { lcp: data.lcp, inp: data.inp, cls: data.cls } });
    } else await prisma.webVital.create({ data });

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('Vitals ingest error:', err);
    return NextResponse.json(
      { error: 'Failed to record vitals' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET — called by the dashboard (web-vitals.tsx) to read live P75 scores
export async function GET(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const projectId = req.nextUrl.searchParams.get('projectId');
    const daysParam = req.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 28;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400, headers }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404, headers });
    }

    const data = await getP75Vitals(projectId, isNaN(days) ? 28 : days);
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Vitals read error:', error);
    return NextResponse.json({ error: 'Failed to read vitals' }, { status: 500, headers });
  }
}
