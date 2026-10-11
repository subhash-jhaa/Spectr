import { NextRequest } from 'next/server';
import { handleHistoricalStatsRoute } from '@/lib/api-utils';
import { RequestContext, CountriesStatsResponse } from '../../../../../../interfaces/api';
import { EventQueries } from '../../../../../../queries';

export async function GET(
  request: NextRequest,
  { params }: RequestContext
): Promise<CountriesStatsResponse> {
  return handleHistoricalStatsRoute(request, params, (projectId, days) => EventQueries.getCountryStats(projectId, days));
}