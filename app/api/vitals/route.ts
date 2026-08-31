import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getP75Vitals } from '@/lib/web-vitals-analytics';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting — mirrors /api/track pattern (60 req/min per IP, sliding window)
const hasRedisConfig = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'spectr:vitals',
    })
  : null;

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
    // Rate limit check (per IP, 60 requests per minute)
    if (ratelimit) {
      const ip = getClientIP(req);
      const { success, reset } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        );
      }
    }

    let body;
    try {
      body = await req.json();
    } catch {
      // In case text/blob is sent via sendBeacon
      const text = await req.text();
      body = JSON.parse(text);
    }

    const { projectId, lcp, inp, cls, pageUrl, device } = body;

    if (!projectId || !pageUrl) {
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

    await prisma.webVital.create({
      data: {
        projectId,
        lcp: typeof lcp === 'number' && !isNaN(lcp) ? lcp : null,
        inp: typeof inp === 'number' && !isNaN(inp) ? inp : null,
        cls: typeof cls === 'number' && !isNaN(cls) ? cls : null,
        pageUrl: String(pageUrl).slice(0, 500),
        device: device ? String(device).slice(0, 50) : null,
      },
    });

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
  const projectId = req.nextUrl.searchParams.get('projectId');
  const daysParam = req.nextUrl.searchParams.get('days');
  const days = daysParam ? parseInt(daysParam, 10) : 28;

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId required' },
      { status: 400, headers: corsHeaders }
    );
  }

  const data = await getP75Vitals(projectId, isNaN(days) ? 28 : days);
  return NextResponse.json(data, { headers: corsHeaders });
}
