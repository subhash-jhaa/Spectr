import { NextRequest } from 'next/server';
import { handleStatsRoute } from '@/lib/api-utils';
import { RequestContext, CountriesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<CountriesStatsResponse> {
  return handleStatsRoute(params, (projectId) => EventQueries.getCountryStats(projectId, 7));
}