import { NextRequest } from 'next/server';
import { ownedProject, privateJson } from '@/lib/project-access';
import { parseHistorySelection } from '@/lib/history-range';
import { readJsonBody } from '@/lib/request-limits';
import { prisma } from '@/lib/prisma';
import { validEventName } from '@/lib/custom-events';
import { goalStats } from '@/queries/goals';
import { randomUUID } from 'crypto';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  try { const access = await ownedProject(context, 'goals'); if (access.error) return access.error;
    const range = parseHistorySelection(request.nextUrl.searchParams);
    if (range === null) return privateJson({ error: 'Invalid date range' }, 400);
    return privateJson(await goalStats(access.id!, range));
  } catch (error) { console.error('Goals read failed:', error); return privateJson({ error: 'Unable to load goals' }, 500); }
}
export async function POST(request: NextRequest, context: Context) {
  try { const access = await ownedProject(context, 'goals'); if (access.error) return access.error;
    let body; try { body = await readJsonBody(request); } catch { return privateJson({ error: 'Invalid body' }, 400); }
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80 || !validEventName(body.eventName)) return privateJson({ error: 'Enter a goal name and a valid event name' }, 400);
    const name = body.name.trim();
    const count = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${access.id!}))`;
      return tx.$executeRaw`INSERT INTO "Goal" ("id", "projectId", "name", "eventName")
      SELECT ${randomUUID()}, ${access.id!}, ${name}, ${body.eventName}
      WHERE (SELECT COUNT(*) FROM "Goal" WHERE "projectId" = ${access.id!}) < 50
      ON CONFLICT ("projectId", "eventName") DO NOTHING`;
    });
    return count ? privateJson({ success: true }, 201) : privateJson({ error: 'Goal already exists or the 50-goal limit was reached' }, 409);
  } catch { return privateJson({ error: 'Unable to create goal' }, 500); }
}
export async function DELETE(request: NextRequest, context: Context) {
  try { const access = await ownedProject(context, 'goals'); if (access.error) return access.error;
    const id = request.nextUrl.searchParams.get('goalId');
    if (!id || id.length > 128) return privateJson({ error: 'Invalid goal ID' }, 400);
    await prisma.$executeRaw`DELETE FROM "Goal" WHERE "id" = ${id} AND "projectId" = ${access.id!}`;
    return privateJson({ success: true });
  } catch { return privateJson({ error: 'Unable to remove goal' }, 500); }
}
