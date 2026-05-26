import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from './auth';

export async function getSession() {
  return await getServerSession(authConfig);
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth');
  }
  
  return session;
}

export async function requireGuest() {
  const session = await getSession();
  
  if (session?.user) {
    redirect('/dashboard');
  }
  
  return session;
}

export async function getOptionalSession() {
  try {
    return await getSession();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Dynamic server usage') ||
       error.message.includes('dynamic') ||
       ('digest' in error && (error as Record<string, unknown>).digest === 'DYNAMIC_SERVER_USAGE'))
    ) {
      throw error;
    }
    console.error("Failed to retrieve optional session (database might be offline/sleeping):", error);
    return null;
  }
}