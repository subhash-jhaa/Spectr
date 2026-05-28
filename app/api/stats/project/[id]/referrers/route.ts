import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, ReferrersStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<ReferrersStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getReferrerStats(projectId, 7));
}