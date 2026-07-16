/**
 * Next.js 15 compatible session helper.
 *
 * next-auth v4's getServerSession() hangs indefinitely in Next.js 15 App Router
 * because it relies on legacy internal APIs (res.setHeader, etc.) that no longer
 * exist in the App Router runtime.
 *
 * This helper reads the session token cookie directly via next/headers and
 * queries Prisma to validate the session — the correct approach for Next.js 15.
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export async function getAppSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();

    // next-auth v4 uses these cookie names depending on the environment
    const sessionToken =
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) return null;

    // Look up the session in the database (database strategy)
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
    });

    // Validate session existence and expiry
    if (!session || session.expires < new Date()) return null;

    return {
      id: session.user.id,
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    };
  } catch (error) {
    console.error('[session] Failed to get session:', error);
    return null;
  }
}

export async function requireAppSession(): Promise<SessionUser> {
  const user = await getAppSession();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Redirect authenticated users to /dashboard.
 * Used on pages like /auth that only guests should see.
 */
export async function requireGuestSession(): Promise<null> {
  const { redirect } = await import('next/navigation');
  const user = await getAppSession();
  if (user?.id) {
    redirect('/dashboard');
  }
  return null;
}

/**
 * Non-throwing session check — returns null when not logged in.
 */
export async function getOptionalAppSession(): Promise<SessionUser | null> {
  return getAppSession();
}
