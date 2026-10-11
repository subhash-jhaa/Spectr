import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';
import { createErrorResponse, createSuccessResponse, getClientIP, handleCorsPreflight } from '@/lib/api-utils';
import { botFilteringEnabled, isKnownBot } from '@/lib/traffic-filters';
import { eventProperties, validEventName } from '@/lib/custom-events';
import { randomUUID } from 'crypto';
export const OPTIONS = handleCorsPreflight;
export async function POST(request: NextRequest) {
  try {
    const limit = await checkRateLimit('custom-events', getClientIP(request));
    if (limit.status !== 200) return createErrorResponse('Event tracking temporarily unavailable', limit.status, { 'Retry-After': String(limit.retryAfter) });
    let body; try { body = await readJsonBody(request); } catch { return createErrorResponse('Invalid event body', 400); }
    const { projectId, eventId, eventName, sessionId, pageViewId, occurredAt } = body;
    const properties = eventProperties(body.properties);
    if (![projectId, eventId, sessionId, pageViewId].every(value => typeof value === 'string' && /^[a-zA-Z0-9_.:-]{6,128}$/.test(value)) || !validEventName(eventName) || properties === null) return createErrorResponse('Invalid custom event', 400);
    const now = Date.now();
    if (typeof occurredAt !== 'number' || !Number.isFinite(occurredAt) || occurredAt < now - 86400000 || occurredAt > now + 60000) return createErrorResponse('Invalid event timestamp', 400);
    const project = await prisma.project.findUnique({ where: { id: projectId as string }, select: { id: true } });
    if (!project) return createErrorResponse('Project not found', 404);
    if (isKnownBot(request.headers.get('user-agent') || '') && await botFilteringEnabled(project.id)) return createSuccessResponse({ success: true, filtered: 'bot' });
    const anchor = await prisma.event.findFirst({ where: { projectId: project.id, sessionId: sessionId as string, pageViewId: pageViewId as string }, select: { source: true } });
    if (!anchor) return createErrorResponse('Pageview not received', 409);
    await prisma.$executeRaw`INSERT INTO "CustomEvent" ("id", "projectId", "eventId", "eventName", "sessionId", "pageViewId", "source", "properties", "timestamp")
      VALUES (${randomUUID()}, ${project.id}, ${eventId as string}, ${eventName}, ${sessionId as string}, ${pageViewId as string}, ${anchor.source}, ${JSON.stringify(properties)}::jsonb, ${new Date(occurredAt)})
      ON CONFLICT ("projectId", "eventId") DO NOTHING`;
    return createSuccessResponse({ success: true });
  } catch (error) { console.error('Custom event failed:', error); return createErrorResponse('Unable to record event', 500); }
}
