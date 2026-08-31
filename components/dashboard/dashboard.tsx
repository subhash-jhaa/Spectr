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
import { OverviewMetrics, OverviewMetricKey } from "@/components/dashboard/overview-metrics";
import { OverviewMetrics as OverviewMetricsType } from "@/interfaces/database";

export interface DashboardProps {
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
	projectId,
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
				activeMetric={activeMetric}
				onSelectMetric={setActiveMetric}
			/>
			<VisitorsChart 
				data={dailyStats} 
				activeMetric={activeMetric}
				overviewMetrics={overviewMetrics}
				delta={overviewMetrics?.visitors.delta} 
				isNew={overviewMetrics?.visitors.isNew} 
			/>
			<OnlineNow count={realtimeStats?.count} visitors={realtimeStats?.visitors} deviceStats={deviceStats} />
			<TopPages data={pageStats} />
			<TopCountries data={countryStats} />
			<TopSources data={sourceStats} />
			<ReferrerPanel projectId={projectId} />
			<AudienceMix data={audienceMix} />
			<BrowserShare data={browserStats} />
			<WebVitals projectId={projectId} />
		</div>
	);
}
