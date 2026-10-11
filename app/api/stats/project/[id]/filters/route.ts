import { NextRequest } from 'next/server';
import { ownedProject, privateJson } from '@/lib/project-access';
import { botFilteringEnabled } from '@/lib/traffic-filters';
import { readJsonBody } from '@/lib/request-limits';
import { prisma } from '@/lib/prisma';
type Context = { params: Promise<{ id: string }> };
export async function GET(_: NextRequest, context: Context) {
  try { const access = await ownedProject(context, 'filters'); if (access.error) return access.error;
    return privateJson({ filterBots: await botFilteringEnabled(access.id!) });
  } catch { return privateJson({ error: 'Unable to load traffic filters' }, 500); }
}
export async function PATCH(request: NextRequest, context: Context) {
  try { const access = await ownedProject(context, 'filters'); if (access.error) return access.error;
    let body; try { body = await readJsonBody(request); } catch { return privateJson({ error: 'Invalid body' }, 400); }
    if (typeof body.filterBots !== 'boolean') return privateJson({ error: 'filterBots must be a boolean' }, 400);
    await prisma.$executeRaw`UPDATE "Project" SET "filterBots" = ${body.filterBots} WHERE "id" = ${access.id!}`;
    return privateJson({ filterBots: body.filterBots });
  } catch { return privateJson({ error: 'Unable to update traffic filters' }, 500); }
}
