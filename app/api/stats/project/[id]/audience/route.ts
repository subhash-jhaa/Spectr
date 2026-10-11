import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, AudienceStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<AudienceStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getAudienceMix(projectId, days));
}
