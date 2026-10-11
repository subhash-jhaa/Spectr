import { prisma } from '@/lib/prisma';
const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|linkedinbot|embedly|quora|pinterest|twitterbot|whatsapp|telegram|googlebot|yandex|baiduspider|duckduckbot|semrush|ahrefsbot|dotbot|rogerbot|screaming frog/i;
export const isKnownBot = (userAgent: string) => BOT_PATTERN.test(userAgent);
export async function botFilteringEnabled(projectId: string) {
  const rows = await prisma.$queryRaw<{ filterBots: boolean }[]>`SELECT "filterBots" FROM "Project" WHERE "id" = ${projectId}`;
  return rows[0]?.filterBots ?? true;
}
