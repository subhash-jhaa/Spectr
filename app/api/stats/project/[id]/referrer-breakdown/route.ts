import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
) {
  const searchParams = request.nextUrl.searchParams;
  const dimension = searchParams.get('dimension') || 'refs';

  return handleHistoricalStatsRoute(request, params, (projectId, days) =>
    EventQueries.getReferrerBreakdown(projectId, dimension, days)
  );
}
