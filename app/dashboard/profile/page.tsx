import { requireAppSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  let sessionUser;
  try {
    sessionUser = await requireAppSession();
  } catch {
    redirect('/auth');
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      projects: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) return null;

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        image: user.image ?? '',
        createdAt: user.createdAt.toISOString(),
      }}
      projects={user.projects.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}

