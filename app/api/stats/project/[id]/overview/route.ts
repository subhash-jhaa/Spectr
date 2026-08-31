import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext } from '@/interfaces/api';
import { EventQueries } from '@/queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
) {
  const { searchParams } = new URL(request.url);
  const daysParam = parseInt(searchParams.get('days') || '7', 10);
  const days = isNaN(daysParam) || daysParam <= 0 ? 7 : daysParam;

  return handleStatsRoute(params, (projectId) => EventQueries.getOverviewMetrics(projectId, days));
}
