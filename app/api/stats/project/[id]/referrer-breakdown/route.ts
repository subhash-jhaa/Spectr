import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
) {
  const searchParams = request.nextUrl.searchParams;
  const dimension = searchParams.get('dimension') || 'refs';
  const days = parseInt(searchParams.get('days') || '7', 10);

  return handleStatsRoute(params, (projectId) =>
    EventQueries.getReferrerBreakdown(projectId, dimension, isNaN(days) ? 7 : days)
  );
}
