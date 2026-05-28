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
import { 
  TrackingRequest, 
  TrackingResponse,
  LocationData 
} from '../../../interfaces/api';
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
      limiter: Ratelimit.tokenBucket(10, '1 m', 20),
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
    const { projectId, pageUrl, referrer, userAgent, sessionId } = body;

    // Validate required fields
    if (!body.projectId || !body.pageUrl) {
      return createErrorResponse('Missing required fields: projectId, pageUrl', 400);
    }

    if (!validateProjectId(projectId)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    // Get the client IP early for rate limiting and geolocation
    const ip = getClientIP(request);

    // Rate Limiting
    if (ratelimit) {
      const identifier = `${ip}:${projectId}`;
      const { success, reset } = await ratelimit.limit(identifier);

      if (!success) {
        return createErrorResponse('Too many requests', 429, {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        });
      }
    }

    // Verify project exists
    const projectResult = await ProjectQueries.findById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return createErrorResponse('Project not found', 404);
    }

    // Detect location from headers
    let country = getCountry(request);
    let city = getCity(request);

    // Debug logging for development
    debugLog('Tracking Debug Info:', {
      ip,
      country,
      city,
      pageUrl,
      sessionId,
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

    // If we couldn't get location from headers, try IP geolocation
    if (country === 'Unknown' && ip !== 'Unknown') {
      const location: LocationData = await getLocationFromIP(ip);
      country = location.country;
      city = location.city;
      
      debugLog('IP Geolocation Result:', { ip, location });
    }

    // Check for recent events from the same session
    if (sessionId) {
      const existingEventResult = await EventQueries.findRecentBySession(projectId, sessionId, 5);

      if (existingEventResult.success && existingEventResult.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingEvent = existingEventResult.data as any;
        
        // Check if this is a page change (different URL)
        if (existingEvent.pageUrl === pageUrl) {
          // Same page, update the existing event
          const updateResult = await EventQueries.update(existingEvent.id, {
            referrer: referrer || '',
            userAgent: userAgent || '',
            timestamp: new Date(), // Update timestamp to show recent activity
          });

          if (!updateResult.success || !updateResult.data) {
            return createErrorResponse('Failed to update event', 500);
          }

          // Broadcast update for real-time updates
          try {
            await broadcastUpdate(projectId);
          } catch (error) {
            console.debug('Failed to broadcast update:', error);
          }

          return createSuccessResponse({ 
            success: true, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventId: (updateResult.data as any).id, 
            updated: true 
          });
        } else {
          // Different page, create a new event to show navigation
          const createResult = await EventQueries.create({
            projectId,
            sessionId: sessionId || '',
            pageUrl,
            referrer: referrer || '',
            userAgent: userAgent || '',
            country: country,
            city: city,
          });

          if (!createResult.success || !createResult.data) {
            return createErrorResponse('Failed to create event', 500);
          }

          // Broadcast update for real-time updates
          try {
            await broadcastUpdate(projectId);
          } catch (error) {
            console.debug('Failed to broadcast update:', error);
          }

          return createSuccessResponse({ 
            success: true, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventId: (createResult.data as any).id, 
            updated: false, 
            pageChange: true 
          });
        }
      }
    }

    // Create new event (first visit or no session)
    const createResult = await EventQueries.create({
      projectId,
      sessionId: sessionId || '',
      pageUrl,
      referrer: referrer || '',
      userAgent: userAgent || '',
      country: country,
      city: city,
    });

    if (!createResult.success || !createResult.data) {
      return createErrorResponse('Failed to create event', 500);
    }

    // Broadcast update for real-time updates
    try {
      await broadcastUpdate(projectId);
    } catch (error) {
      console.debug('Failed to broadcast update:', error);
    }

    return createSuccessResponse({ 
      success: true, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eventId: (createResult.data as any).id, 
      updated: false 
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 