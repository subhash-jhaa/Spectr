import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, DevicesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<DevicesStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getDeviceStats(projectId, 7));
}
