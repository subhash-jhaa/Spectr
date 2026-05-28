import { NextRequest } from 'next/server';
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return createErrorResponse('Name cannot be empty', 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    });

    return createSuccessResponse({ name: updated.name });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return createErrorResponse('Failed to update profile', 500);
  }
}
