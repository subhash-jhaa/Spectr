import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, ReferrersStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<ReferrersStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getReferrerStats(projectId, days));
}