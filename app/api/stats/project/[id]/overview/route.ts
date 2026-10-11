import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext } from '@/interfaces/api';
import { EventQueries } from '@/queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
) {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getOverviewMetrics(projectId, days));
}
