import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getP75Vitals } from '@/lib/web-vitals-analytics';
import { getAuthenticatedUser } from '@/lib/api-utils';
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';
import { randomUUID } from 'crypto';
import { botFilteringEnabled, isKnownBot } from '@/lib/traffic-filters';

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

    const { projectId, lcp, inp, cls, pageUrl, device, sampleId, sampleRevision } = body;
    if (sampleRevision !== undefined && (typeof sampleRevision !== 'number' || !Number.isSafeInteger(sampleRevision) || sampleRevision < 1 || sampleRevision > 2147483647 || typeof sampleId !== 'string')) {
      return NextResponse.json({ error: 'Invalid sample revision' }, { status: 400, headers: corsHeaders });
    }

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
    if (isKnownBot(req.headers.get('user-agent') || '') && await botFilteringEnabled(project.id)) return NextResponse.json({ ok: true, filtered: 'bot' }, { headers: corsHeaders });

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
      // Atomic conflict handling protects against concurrent and out-of-order snapshots.
      // Legacy clients can update legacy rows, but cannot overwrite versioned samples.
      await prisma.$executeRaw`
        INSERT INTO "WebVital" ("id", "projectId", "sampleId", "sampleRevision", "lcp", "inp", "cls", "pageUrl", "device", "createdAt")
        VALUES (${randomUUID()}, ${projectId}, ${sampleId}, ${sampleRevision ?? 0}::integer,
          ${data.lcp}::double precision, ${data.inp}::double precision, ${data.cls}::double precision, ${data.pageUrl}, ${data.device}, NOW())
        ON CONFLICT ("projectId", "sampleId") DO UPDATE SET
          "lcp" = COALESCE(EXCLUDED."lcp", "WebVital"."lcp"),
          "inp" = COALESCE(EXCLUDED."inp", "WebVital"."inp"),
          "cls" = COALESCE(EXCLUDED."cls", "WebVital"."cls"),
          "sampleRevision" = EXCLUDED."sampleRevision"
        WHERE EXCLUDED."sampleRevision" > "WebVital"."sampleRevision"
          OR (EXCLUDED."sampleRevision" = 0 AND "WebVital"."sampleRevision" = 0)
      `;
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
    const days = daysParam === null ? 28 : Number(daysParam);
    if (daysParam !== null && (!/^[1-9]\d{0,2}$/.test(daysParam) || !Number.isInteger(days) || days > 90)) {
      return NextResponse.json({ error: 'days must be an integer from 1 to 90' }, { status: 400, headers });
    }

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

    const data = await getP75Vitals(projectId, days);
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Vitals read error:', error);
    return NextResponse.json({ error: 'Failed to read vitals' }, { status: 500, headers });
  }
}
