import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, SourcesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<SourcesStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getSourceStats(projectId, 7));
}
