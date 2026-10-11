import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, SourcesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<SourcesStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getSourceStats(projectId, days));
}
