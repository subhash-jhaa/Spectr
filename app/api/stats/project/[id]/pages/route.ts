import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, PagesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<PagesStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getPageStats(projectId, days));
}
