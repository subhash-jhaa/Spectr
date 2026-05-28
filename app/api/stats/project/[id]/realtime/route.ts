import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, RealtimeStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<RealtimeStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getRealtimeStats(projectId, 1));
}