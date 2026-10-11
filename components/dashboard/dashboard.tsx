'use client';

import React, { useState } from "react";
import { AudienceMix } from "@/components/dashboard/audience-mix";
import { BrowserShare } from "@/components/dashboard/browser-share";
import { OnlineNow } from "@/components/dashboard/online-now";
import { TopCountries } from "@/components/dashboard/top-countries";
import { TopPages } from "@/components/dashboard/top-pages";
import { TopSources } from "@/components/dashboard/top-sources";
import { ReferrerPanel } from "@/components/dashboard/referrer-panel";
import { VisitorsChart } from "@/components/dashboard/visitors-chart";
import { WebVitals } from "@/components/dashboard/web-vitals";
import type { VitalsData } from "@/components/dashboard/web-vitals";
import { OverviewMetrics, OverviewMetricKey } from "@/components/dashboard/overview-metrics";
import { OverviewMetrics as OverviewMetricsType } from "@/interfaces/database";

export interface DashboardProps {
  rangeQuery?: string;
  periodLabel?: string;
  compare?: boolean;
  days?: number;
  loading?: boolean;
  initialVitals?: VitalsData | null;
	projectId?: string;
	overviewMetrics?: OverviewMetricsType;
	dailyStats?: { date: string; visitors: number; pageViews: number; bounceRate?: number }[];
	realtimeStats?: { count: number; visitors: { id: string; pageUrl: string; referrer: string; country: string; city: string; userAgent: string; timestamp: string }[] };
	countryStats?: { country: string; visitors: number }[];
	referrerStats?: { referrer: string; visitors: number }[];
	sourceStats?: { source: string; visitors: number; percentage?: number }[];
	pageStats?: { pageUrl: string; visitors: number; pageViews: number }[];
	browserStats?: { browser: string; visitors: number; share: number }[];
	deviceStats?: { device: string; share: number }[];
	audienceMix?: { newVisitors: number; returningVisitors: number; newShare: number; returningShare: number };
}

export function Dashboard({
  rangeQuery,
  periodLabel,
  compare = true,
  days = 7,
  loading,
	projectId,
	initialVitals,
	overviewMetrics,
	dailyStats,
	realtimeStats,
	countryStats,
	sourceStats,
	pageStats,
	browserStats,
	deviceStats,
	audienceMix
}: DashboardProps) {
	const [activeMetric, setActiveMetric] = useState<OverviewMetricKey>('visitors');

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<OverviewMetrics 
				data={overviewMetrics}
        compare={compare}
        periodLabel={periodLabel}
				days={days}
				loading={loading}
				activeMetric={activeMetric}
				onSelectMetric={setActiveMetric}
			/>
			<VisitorsChart 
        rangeStart={rangeQuery ? new URLSearchParams(rangeQuery).get('start') || undefined : undefined}
				data={dailyStats}
        compare={compare}
        periodLabel={periodLabel}
				days={days}
				activeMetric={activeMetric}
				overviewMetrics={overviewMetrics}
				delta={overviewMetrics?.visitors.delta} 
				isNew={overviewMetrics?.visitors.isNew} 
			/>
			<OnlineNow count={realtimeStats?.count} visitors={realtimeStats?.visitors} deviceStats={deviceStats} />
			<TopPages days={days} periodLabel={periodLabel} data={pageStats} />
			<TopCountries data={countryStats} />
			<TopSources data={sourceStats} days={days} periodLabel={periodLabel} />
			<ReferrerPanel key={`${projectId}:${rangeQuery || days}`} rangeQuery={rangeQuery} days={days} projectId={projectId} />
			<AudienceMix days={days} periodLabel={periodLabel} data={audienceMix} />
			<BrowserShare data={browserStats} />
			<WebVitals key={projectId} projectId={projectId} initialData={initialVitals} />
		</div>
	);
}
