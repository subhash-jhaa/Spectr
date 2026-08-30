import { NextRequest, NextResponse } from 'next/server';
import { getAppSession, requireAppSession } from '@/lib/session';
import { SessionUser, ApiErrorResponse, CorsHeaders } from '../interfaces/api';
import { ProjectQueries } from '../queries';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Authenticated API rate limiter (generous: 60 req/min per user)
const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const authRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: '@upstash/ratelimit:auth',
    })
  : null;

// CORS headers for cross-origin requests
export const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Authentication utilities — Next.js 15 App Router compatible
export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const user = await getAppSession();
  if (!user) return null;
  return user as unknown as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await requireAppSession();
  return user as unknown as SessionUser;
}

// Project ownership verification
export async function verifyProjectOwnership(projectId: string, userId: string) {
  const result = await ProjectQueries.findByIdAndUser(projectId, userId);

  if (!result.success || !result.data) {
    throw new Error('Project not found or access denied');
  }

  return result.data;
}

// Error response utilities
export function createErrorResponse(
  message: string,
  status: number = 500,
  headers?: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { ...corsHeaders, ...headers }
    }
  );
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: { ...corsHeaders, ...headers }
  });
}

// Request validation utilities
export function validateRequiredFields(body: Record<string, unknown>, fields: string[]): string[] {
  const missingFields: string[] = [];

  for (const field of fields) {
    if (!body[field]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

export function validateProjectId(projectId: string): boolean {
  return Boolean(projectId && projectId.length > 0);
}

// Geolocation utilities
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const xClientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  if (xClientIP) {
    return xClientIP;
  }

  return 'Unknown';
}

import { getCountryFromTimezone, getCountryFromLocale, getCountryName } from '@/lib/geo-utils';

export function getCountry(request: NextRequest, clientTimezone?: string, clientLocale?: string): string {
  const cfCountry = request.headers.get('cf-ipcountry');
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  const cloudfrontCountry = request.headers.get('cloudfront-viewer-country');
  const xCountry = request.headers.get('x-country');
  const xGeoCountry = request.headers.get('x-geo-country');

  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') {
    return getCountryName(cfCountry);
  }
  if (vercelCountry && vercelCountry !== 'XX') {
    return getCountryName(vercelCountry);
  }
  if (cloudfrontCountry) {
    return getCountryName(cloudfrontCountry);
  }
  if (xCountry) {
    return getCountryName(xCountry);
  }
  if (xGeoCountry) {
    return getCountryName(xGeoCountry);
  }

  // Fallback to client-side timezone if headers are unavailable (e.g. localhost, private IPs)
  const tzCountry = getCountryFromTimezone(clientTimezone);
  if (tzCountry) {
    return getCountryName(tzCountry);
  }

  // Fallback to client browser locale
  const locCountry = getCountryFromLocale(clientLocale);
  if (locCountry) {
    return getCountryName(locCountry);
  }

  return 'Unknown';
}

export function getCity(request: NextRequest, clientTimezone?: string): string {
  const cfCity = request.headers.get('cf-ipcity');
  const vercelCity = request.headers.get('x-vercel-ip-city');
  const cloudfrontCity = request.headers.get('cloudfront-viewer-city');
  const xCity = request.headers.get('x-city');
  const xGeoCity = request.headers.get('x-geo-city');

  if (cfCity) {
    try { return decodeURIComponent(cfCity); } catch { return cfCity; }
  }
  if (vercelCity) {
    try { return decodeURIComponent(vercelCity); } catch { return vercelCity; }
  }
  if (cloudfrontCity) {
    try { return decodeURIComponent(cloudfrontCity); } catch { return cloudfrontCity; }
  }
  if (xCity) {
    try { return decodeURIComponent(xCity); } catch { return xCity; }
  }
  if (xGeoCity) {
    try { return decodeURIComponent(xGeoCity); } catch { return xGeoCity; }
  }

  // If city is unknown, extract city name from timezone (e.g. 'Asia/Kolkata' -> 'Kolkata')
  if (clientTimezone && clientTimezone.includes('/')) {
    const citySegment = clientTimezone.split('/')[1];
    if (citySegment) {
      return citySegment.replace(/_/g, ' ');
    }
  }

  return 'Unknown';
}

// IP geolocation fallback
export async function getLocationFromIP(ip: string): Promise<{ country: string; city: string }> {
  try {
    // Skip if IP is localhost or private
    if (!ip || ip === 'Unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === 'localhost') {
      return { country: 'Unknown', city: 'Unknown' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(`https://ipwho.is/${ip}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Spectr-Analytics' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          return {
            country: data.country || (data.country_code ? getCountryName(data.country_code) : 'Unknown'),
            city: data.city || 'Unknown'
          };
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.debug('IP geolocation failed:', error);
  }

  return { country: 'Unknown', city: 'Unknown' };
}

// Session deduplication utilities
export function getVisitorKey(event: { sessionId?: string; ip: string }): string {
  return event.sessionId || event.ip;
}

// Date utilities for stats
export function getTimeRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getMinutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

// Debug logging utility
export function debugLog(message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

// CORS preflight handler
export async function handleCorsPreflight(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Unified stats route handler helper to reduce duplication
export async function handleStatsRoute<T>(
  params: Promise<{ id: string }>,
  fetchData: (projectId: string) => Promise<{ success: boolean; data?: T; error?: string }>
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    const user = await requireAuth();

    // Rate limit authenticated API routes (fails open if Redis is unreachable)
    if (authRatelimit) {
      try {
        const { success } = await authRatelimit.limit(user.id);
        if (!success) {
          return createErrorResponse('Too many requests', 429);
        }
      } catch (rateLimitErr) {
        console.debug('Auth rate limit check skipped:', rateLimitErr);
      }
    }

    const { id: projectId } = await params;
    await verifyProjectOwnership(projectId, user.id);
    const result = await fetchData(projectId);
    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to fetch stats', 500);
    }
    return createSuccessResponse(result.data!);
  } catch (error) {
    console.error('Stats route error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized'))
        return createErrorResponse('Unauthorized', 401);
      if (error.message.includes('Project not found'))
        return createErrorResponse('Project not found', 404);
    }
    return createErrorResponse('Internal server error', 500);
  }
} 