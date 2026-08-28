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
import { DatabaseEvent } from '../../../interfaces/database';
import { ProjectQueries, EventQueries } from '../../../queries';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!hasRedisConfig && process.env.NODE_ENV === 'development') {
  console.warn(
    '[WARN] Upstash Redis credentials not configured. IP-based rate limiting is disabled.'
  );
}

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
      prefix: '@upstash/ratelimit',
    })
  : null;

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(request: NextRequest): Promise<TrackingResponse> {
  try {
    const body: TrackingRequest = await request.json();
    const { projectId, pageUrl, referrer, userAgent, sessionId, timezone, locale } = body;

    // Extract UTM parameters from client payload
    const utmMedium   = body.utm?.utm_medium   || null;
    const utmCampaign = body.utm?.utm_campaign || null;
    const utmTerm     = body.utm?.utm_term     || null;
    const utmContent  = body.utm?.utm_content  || null;

    // Validate required fields
    if (!body.projectId || !body.pageUrl) {
      return createErrorResponse('Missing required fields: projectId, pageUrl', 400);
    }

    if (!validateProjectId(projectId)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    // Bot/crawler filtering — exclude from analytics
    const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|linkedinbot|embedly|quora|pinterest|twitterbot|whatsapp|telegram|googlebot|yandex|baiduspider|duckduckbot|semrush|ahrefsbot|dotbot|rogerbot|screaming frog/i;
    if (userAgent && BOT_PATTERN.test(userAgent)) {
      return createSuccessResponse({ success: true, eventId: 'bot' });
    }

    // Verify project exists (by ID or fallback by name)
    const projectResult = await ProjectQueries.findByIdOrName(projectId);
    if (!projectResult.success || !projectResult.data) {
      return createErrorResponse('Project not found', 404);
    }
    const resolvedProjectId = projectResult.data.id;

    // Get the client IP early for rate limiting and geolocation
    const ip = getClientIP(request);

    // Rate Limiting
    if (ratelimit) {
      const identifier = `${ip}:${resolvedProjectId}`;
      const { success, reset } = await ratelimit.limit(identifier);

      if (!success) {
        return createErrorResponse('Too many requests', 429, {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        });
      }
    }

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

    // Check for recent events from the same session
    if (sessionId) {
      const existingEventResult = await EventQueries.findRecentBySession(resolvedProjectId, sessionId, 5);

      if (existingEventResult.success && existingEventResult.data) {
        const existingEvent = existingEventResult.data as DatabaseEvent;
        
        // Check if this is a page change (different URL)
        if (existingEvent.pageUrl === pageUrl) {
          // Same page, update the existing event
          const updateResult = await EventQueries.update(existingEvent.id, {
            referrer: referrer || '',
            source,
            userAgent: userAgent || '',
            ip: ip || 'Unknown',
            timestamp: new Date(), // Update timestamp to show recent activity
          });

          if (!updateResult.success || !updateResult.data) {
            return createErrorResponse('Failed to update event', 500);
          }

          // Broadcast update for real-time updates
          try {
            await broadcastUpdate(resolvedProjectId);
          } catch (error) {
            console.debug('Failed to broadcast update:', error);
          }

          return createSuccessResponse({ 
            success: true, 
            eventId: (updateResult.data as DatabaseEvent).id, 
            updated: true 
          });
        } else {
          // Different page, create a new event to show navigation
          const createResult = await EventQueries.create({
            projectId: resolvedProjectId,
            sessionId: sessionId || '',
            pageUrl,
            referrer: referrer || '',
            source,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
            userAgent: userAgent || '',
            ip: ip || 'Unknown',
            country: country,
            city: city,
          });

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
            eventId: (createResult.data as DatabaseEvent).id, 
            updated: false, 
            pageChange: true 
          });
        }
      }
    }

    // Create new event (first visit or no session)
    const createResult = await EventQueries.create({
      projectId: resolvedProjectId,
      sessionId: sessionId || '',
      pageUrl,
      referrer: referrer || '',
      source,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      userAgent: userAgent || '',
      ip: ip || 'Unknown',
      country: country,
      city: city,
    });

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
      eventId: (createResult.data as DatabaseEvent).id, 
      updated: false 
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 