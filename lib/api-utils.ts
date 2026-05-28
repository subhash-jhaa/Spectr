import { NextRequest, NextResponse } from 'next/server';
import { getAppSession, requireAppSession } from '@/lib/session';
import { SessionUser, ApiErrorResponse, CorsHeaders } from '../interfaces/api';
import { ProjectQueries } from '../queries';

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

export function getCountry(request: NextRequest): string {
  const cfCountry = request.headers.get('cf-ipcountry');
  const xCountry = request.headers.get('x-country');
  const xGeoCountry = request.headers.get('x-geo-country');
  const xVercelCountry = request.headers.get('x-vercel-ip-country');

  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry;
  }
  if (xCountry) {
    return xCountry;
  }
  if (xGeoCountry) {
    return xGeoCountry;
  }
  if (xVercelCountry) {
    return xVercelCountry;
  }

  return 'Unknown';
}

export function getCity(request: NextRequest): string {
  const cfCity = request.headers.get('cf-ipcity');
  const xCity = request.headers.get('x-city');
  const xGeoCity = request.headers.get('x-geo-city');

  if (cfCity) {
    return cfCity;
  }
  if (xCity) {
    return xCity;
  }
  if (xGeoCity) {
    return xGeoCity;
  }

  return 'Unknown';
}

// IP geolocation fallback
export async function getLocationFromIP(ip: string): Promise<{ country: string; city: string }> {
  try {
    // Skip if IP is localhost or private
    if (ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return { country: 'Unknown', city: 'Unknown' };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      };
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