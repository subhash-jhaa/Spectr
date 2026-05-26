import { NextRequest, NextResponse } from 'next/server';
import { connections, sendStats, markControllerClosed } from '@/lib/broadcaster';
import { 
  requireAuth, 
  verifyProjectOwnership 
} from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let interval: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        
        // Remove only this specific controller from the project's set
        const projectConnections = connections.get(projectId);
        if (projectConnections) {
          projectConnections.delete(controller);
          // If no more clients are watching this project, clean up the map entry
          if (projectConnections.size === 0) {
            connections.delete(projectId);
          }
        }
      };
      
      try {
        const user = await requireAuth();
        await verifyProjectOwnership(projectId, user.id);

        // Add this new connection to the set for this project
        if (!connections.has(projectId)) {
          connections.set(projectId, new Set());
        }
        connections.get(projectId)!.add(controller);
        
        request.signal.addEventListener('abort', () => {
          console.log(`Client for project ${projectId} disconnected.`);
          markControllerClosed(controller);
          cleanup();
          try {
            controller.close();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_e) {}
        });

        if (request.signal.aborted) {
          cleanup();
          return;
        }

        await sendStats(projectId, controller);

        if (request.signal.aborted) {
          cleanup();
          return;
        }

        interval = setInterval(async () => {
          if (request.signal.aborted) {
            cleanup();
            return;
          }
          const projectConnections = connections.get(projectId);
          // If this controller is no longer in the set, it means it was cleaned up
          if (!projectConnections || !projectConnections.has(controller)) {
            cleanup();
            try {
              controller.close();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_e) {}
            return;
          }
          await sendStats(projectId, controller);
        }, 5000);

      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`SSE stream error for project ${projectId}:`, message);
        try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
            controller.close();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(_e) {}
        cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}