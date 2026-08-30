import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, AudienceStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<AudienceStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getAudienceMix(projectId, 30));
}
