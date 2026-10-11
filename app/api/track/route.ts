import { NextRequest } from 'next/server';
import { broadcastUpdate } from '@/lib/broadcaster';
import {
  createErrorResponse,
  createSuccessResponse,
  validateProjectId,
  getClientIP,
  getCountry,
  getCity,
  getLocationFromIP,
  debugLog,
  handleCorsPreflight
} from '@/lib/api-utils';
import { classifySource } from '@/lib/source-classifier';
import {
  TrackingRequest,
  TrackingResponse,
  LocationData
} from '../../../interfaces/api';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';
import { ProjectQueries } from '../../../queries';
import { randomUUID } from 'crypto';
import { acceptTrackingProbe, recordTrackingReceipt } from '@/lib/tracking-health';
import { botFilteringEnabled, isKnownBot } from '@/lib/traffic-filters';

function resolveSessionId(clientSessionId: string | undefined): string {
  if (
    clientSessionId &&
    typeof clientSessionId === 'string' &&
    clientSessionId.length >= 6 &&
    clientSessionId.length <= 128 &&
    /^[a-zA-Z0-9_\-.:]+$/.test(clientSessionId)
  ) {
    return clientSessionId;
  }
  return randomUUID();
}

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(request: NextRequest): Promise<TrackingResponse> {
  try {
    const limit = await checkRateLimit('track', getClientIP(request));
    if (limit.status !== 200) return createErrorResponse(limit.status === 429 ? 'Too many requests' : 'Tracking temporarily unavailable', limit.status, { 'Retry-After': String(limit.retryAfter) });
    let body: TrackingRequest;
    try { body = await readJsonBody(request) as unknown as TrackingRequest; }
    catch (error) { return createErrorResponse('Invalid request body', error instanceof Error && error.message === 'Request body too large' ? 413 : 400); }
    for (const key of ['projectId', 'pageUrl', 'referrer', 'userAgent', 'sessionId', 'timezone', 'locale', 'pageViewId'] as const) {
      const value = body[key];
      if (value !== undefined && (typeof value !== 'string' || value.length > (key === 'pageUrl' || key === 'referrer' ? 2000 : 512))) return createErrorResponse('Invalid tracking fields', 400);
    }
    if (body.type !== undefined && !['pageview', 'heartbeat', 'test'].includes(body.type)) return createErrorResponse('Invalid event type', 400);
    if (body.trackerVersion !== undefined && (typeof body.trackerVersion !== 'string' || !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(body.trackerVersion))) return createErrorResponse('Invalid tracker version', 400);
    const now = Date.now();
    if (body.occurredAt !== undefined && (typeof body.occurredAt !== 'number' || !Number.isFinite(body.occurredAt) || body.occurredAt < now - 86400000 || body.occurredAt > now + 60000)) return createErrorResponse('Invalid event timestamp', 400);
    const { projectId, pageUrl, referrer, userAgent, sessionId, timezone, locale } = body;

    // Extract UTM parameters from client payload
    const utmValue = (value: unknown) => typeof value === 'string' ? value.slice(0, 200) : null;
    const utmMedium   = utmValue(body.utm?.utm_medium);
    const utmCampaign = utmValue(body.utm?.utm_campaign);
    const utmTerm     = utmValue(body.utm?.utm_term);
    const utmContent  = utmValue(body.utm?.utm_content);

    // Validate required fields
    if (!body.projectId || !body.pageUrl) {
      return createErrorResponse('Missing required fields: projectId, pageUrl', 400);
    }

    if (!validateProjectId(projectId)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    // Verify project exists by UUID only (name-lookup removed — was cross-user attack surface)
    const projectResult = await ProjectQueries.findById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return createErrorResponse('Project not found', 404);
    }
    const resolvedProjectId = projectResult.data.id;
    // Installation probes never enter analytics or trigger geolocation.
    if (body.type === 'test') {
      if (typeof body.testToken !== 'string' || !/^[a-f0-9-]{36}$/.test(body.testToken)) return createErrorResponse('Invalid test token', 400);
      if (!await acceptTrackingProbe(resolvedProjectId, body.testToken, body.trackerVersion)) return createErrorResponse('Installation test expired or invalid', 400);
      return createSuccessResponse({ success: true, eventId: 'test' });
    }
    if ((isKnownBot(userAgent || '') || isKnownBot(request.headers.get('user-agent') || '')) && await botFilteringEnabled(resolvedProjectId)) return createSuccessResponse({ success: true, eventId: 'bot' });
    const recordReceipt = async () => {
      // The health store must never hold an already committed pageview hostage.
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([recordTrackingReceipt(resolvedProjectId, body.trackerVersion), new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Tracking health receipt timed out')), 1200);
        })]);
      }
      catch (error) { console.error('Tracking health receipt failed:', error); }
      finally { if (timer !== undefined) clearTimeout(timer); }
    };
    let cleanPageUrl: string;
    let cleanReferrer = '';
    try { const url = new URL(pageUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); cleanPageUrl = url.origin + url.pathname; }
    catch { return createErrorResponse('Invalid page URL', 400); }
    try { const url = new URL(referrer || ''); if (['http:', 'https:'].includes(url.protocol)) cleanReferrer = url.origin + url.pathname; } catch {}
    const resolvedSessionId = resolveSessionId(sessionId);
    const pageViewId = body.pageViewId && /^[a-zA-Z0-9_\-.:]{6,128}$/.test(body.pageViewId) ? body.pageViewId : null;
    // Heartbeats need only an indexed lookup, not another geolocation request.
    if (body.type === 'heartbeat') {
      const event = await prisma.event.findFirst({ where: { projectId: resolvedProjectId, sessionId: resolvedSessionId, ...(pageViewId ? { pageViewId } : { pageUrl: cleanPageUrl }) }, orderBy: { timestamp: 'desc' }, select: { id: true } });
      if (!event) return createErrorResponse('Pageview not received', 409);
      await prisma.event.update({ where: { id: event.id }, data: { lastSeenAt: new Date() } });
      await recordReceipt();
      return createSuccessResponse({ success: true, eventId: event.id, updated: true });
    }

    // Get the client IP early for rate limiting and geolocation
    const ip = getClientIP(request);

    // Detect location from headers, timezone, and locale
    let country = getCountry(request, timezone, locale);
    let city = getCity(request, timezone);

    // Debug logging for development
    debugLog('Tracking Debug Info:', {
      ip,
      country,
      city,
      pageUrl,
      sessionId,
      timezone,
      locale,
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
        'cf-ipcountry': request.headers.get('cf-ipcountry'),
        'x-vercel-ip-country': request.headers.get('x-vercel-ip-country'),
        'x-country': request.headers.get('x-country'),
        'x-geo-country': request.headers.get('x-geo-country'),
      }
    });

    // If country is still Unknown and we have a public IP, perform IP geolocation lookup
    if (country === 'Unknown' && ip !== 'Unknown') {
      const location: LocationData = await getLocationFromIP(ip);
      if (location.country !== 'Unknown') {
        country = location.country;
      }
      if (location.city !== 'Unknown') {
        city = location.city;
      }

      debugLog('IP Geolocation Result:', { ip, location });
    }

    // Classify traffic source from referrer and URL params
    const source = classifySource(referrer, pageUrl);

    // Create new event (first visit or new session)
    const eventData = {
      projectId: resolvedProjectId,
      sessionId: resolvedSessionId,
      pageViewId,
      timestamp: new Date(body.occurredAt ?? now),
      lastSeenAt: new Date(body.occurredAt ?? now),
      pageUrl: cleanPageUrl,
      referrer: cleanReferrer || '',
      source,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      userAgent: userAgent || '',
      ip: 'Unknown',
      country: country,
      city: city,
    };
    const event = pageViewId ? await prisma.event.upsert({ where: { projectId_pageViewId: { projectId: resolvedProjectId, pageViewId } }, create: eventData, update: {} }) : await prisma.event.create({ data: eventData });
    await recordReceipt();
    const createResult = { success: true, data: event };

    if (!createResult.success || !createResult.data) {
      return createErrorResponse('Failed to create event', 500);
    }

    // Broadcast update for real-time updates
    try {
      await broadcastUpdate(resolvedProjectId);
    } catch (error) {
      console.debug('Failed to broadcast update:', error);
    }

    return createSuccessResponse({
      success: true,
      eventId: createResult.data.id,
      updated: false
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
