import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, DevicesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<DevicesStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getDeviceStats(projectId, days));
}
