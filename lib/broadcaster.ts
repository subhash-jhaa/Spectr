import { prisma } from '@/lib/prisma';

export interface Visitor {
  id: string;
  pageUrl: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  timestamp: Date;
  sessionId: string | null;
}

// Store active connections: projectId -> Set of controllers
export const connections = new Map<string, Set<ReadableStreamDefaultController>>();

const closedControllers = new WeakSet<ReadableStreamDefaultController>();

export function markControllerClosed(controller: ReadableStreamDefaultController) {
  closedControllers.add(controller);
  // Remove from all project connection sets
  for (const [projectId, projectConnections] of connections.entries()) {
    if (projectConnections.has(controller)) {
      projectConnections.delete(controller);
      if (projectConnections.size === 0) {
        connections.delete(projectId);
      }
    }
  }
}

export async function sendStats(projectId: string, controller: ReadableStreamDefaultController) {
  // Do not write to a controller that has already been closed
  if (closedControllers.has(controller)) return;

  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const realtimeEvents = await prisma.event.findMany({
      where: {
        projectId,
        timestamp: { gte: oneMinuteAgo },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const uniqueVisitors = new Set();
    const visitorDetails: Visitor[] = [];

    realtimeEvents.forEach(event => {
      const visitorKey = event.sessionId || event.ip;
      if (!uniqueVisitors.has(visitorKey)) {
        uniqueVisitors.add(visitorKey);
        visitorDetails.push({
          id: event.id,
          pageUrl: event.pageUrl,
          referrer: event.referrer,
          country: event.country,
          city: event.city,
          userAgent: event.userAgent,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
        });
      }
    });

    const stats = {
      type: 'stats',
      count: uniqueVisitors.size,
      visitors: visitorDetails,
      timestamp: new Date().toISOString(),
    };

    // Final guard: check again right before enqueue
    if (!closedControllers.has(controller)) {
      controller.enqueue(`data: ${JSON.stringify(stats)}\n\n`);
    }
  } catch (error: unknown) {
    const isClosedError = 
      error instanceof Error && 
      (error.message.includes('Controller is already closed') || 
       error.message.includes('Invalid state') ||
       ('code' in error && error.code === 'ERR_INVALID_STATE'));

    if (isClosedError) {
      markControllerClosed(controller);
    } else {
      console.error('Error getting stats:', error);
    }
  }
}

// Function to broadcast updates to all connected clients for a project
export async function broadcastUpdate(projectId: string) {
  const projectConnections = connections.get(projectId);
  if (projectConnections) {
    const promises = Array.from(projectConnections).map(controller => 
      sendStats(projectId, controller)
    );
    await Promise.all(promises);
  }
}