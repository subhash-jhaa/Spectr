import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await requireAuth();

  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
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
