import { prisma } from '@/lib/prisma';
import { resolveHistory, type HistorySelection } from '@/lib/history-range';
export type GoalResult = { id: string; name: string; eventName: string; conversions: number; convertedSessions: number; sessions: number; conversionRate: number; sources: { source: string; sessions: number; convertedSessions: number; conversions: number; conversionRate: number }[] };
export async function goalStats(projectId: string, selection: HistorySelection): Promise<GoalResult[]> {
  const { startDate, endDate } = resolveHistory(selection);
  const rows = await prisma.$queryRaw<{ id: string; name: string; eventName: string; source: string | null; sessions: number; convertedSessions: number; conversions: number }[]>`
    WITH sessions AS (
      SELECT DISTINCT ON ("sessionId") "sessionId", "source" FROM "Event"
      WHERE "projectId" = ${projectId} AND NULLIF("sessionId", '') IS NOT NULL AND "timestamp" >= ${startDate} AND "timestamp" < ${endDate}
      ORDER BY "sessionId", "timestamp", "id"
    ), events AS (
      SELECT "id", "sessionId", "eventName" FROM "CustomEvent" WHERE "projectId" = ${projectId} AND "timestamp" >= ${startDate} AND "timestamp" < ${endDate}
    )
    SELECT g."id", g."name", g."eventName", s."source",
      COUNT(DISTINCT s."sessionId")::int AS "sessions", COUNT(DISTINCT e."sessionId")::int AS "convertedSessions", COUNT(e."id")::int AS "conversions"
    FROM "Goal" g LEFT JOIN sessions s ON TRUE LEFT JOIN events e ON e."sessionId" = s."sessionId" AND e."eventName" = g."eventName"
    WHERE g."projectId" = ${projectId} GROUP BY g."id", g."name", g."eventName", s."source" ORDER BY g."name", s."source"
  `;
  const goals = new Map<string, GoalResult>();
  for (const row of rows) {
    if (!goals.has(row.id)) goals.set(row.id, { id: row.id, name: row.name, eventName: row.eventName, sessions: 0, conversions: 0, convertedSessions: 0, conversionRate: 0, sources: [] });
    const goal = goals.get(row.id)!;
    const sessions = Number(row.sessions), conversions = Number(row.conversions), convertedSessions = Number(row.convertedSessions);
    goal.sessions += sessions; goal.conversions += conversions; goal.convertedSessions += convertedSessions;
    if (sessions) goal.sources.push({ source: row.source || 'Direct', sessions, conversions, convertedSessions, conversionRate: Math.round(convertedSessions / sessions * 10000) / 100 });
  }
  for (const goal of goals.values()) goal.conversionRate = goal.sessions ? Math.round(goal.convertedSessions / goal.sessions * 10000) / 100 : 0;
  return [...goals.values()];
}
