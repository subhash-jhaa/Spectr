import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, PagesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<PagesStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getPageStats(projectId, 7));
}
