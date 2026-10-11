import { getAuthenticatedUser } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/request-limits';
import { NextResponse } from 'next/server';
export const privateJson = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function ownedProject(context: { params: Promise<{ id: string }> }, scope: string) {
  const user = await getAuthenticatedUser();
  if (!user?.id) return { error: privateJson({ error: 'Unauthorized' }, 401) };
  const { id } = await context.params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!project) return { error: privateJson({ error: 'Project not found' }, 404) };
  const limit = await checkRateLimit(scope, user.id, 60);
  if (limit.status !== 200) return { error: privateJson({ error: 'Temporarily unavailable. Please retry.' }, limit.status) };
  return { id };
}
