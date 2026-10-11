import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, WeeklyStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<WeeklyStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getDailyStats(projectId, days));
}