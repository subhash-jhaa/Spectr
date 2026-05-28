import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, BrowserStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<BrowserStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getBrowserStats(projectId, 7));
}
