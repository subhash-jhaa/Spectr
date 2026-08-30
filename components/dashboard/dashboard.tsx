import { AudienceMix } from "@/components/dashboard/audience-mix";
import { BrowserShare } from "@/components/dashboard/browser-share";
import { OnlineNow } from "@/components/dashboard/online-now";
import { TopCountries } from "@/components/dashboard/top-countries";
import { TopPages } from "@/components/dashboard/top-pages";
import { TopSources } from "@/components/dashboard/top-sources";
import { ReferrerPanel } from "@/components/dashboard/referrer-panel";
import { VisitorsChart } from "@/components/dashboard/visitors-chart";
import { WebVitals } from "@/components/dashboard/web-vitals";

export interface DashboardProps {
	projectId?: string;
	dailyStats?: { date: string; visitors: number }[];
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
	dailyStats,
	realtimeStats,
	countryStats,
	sourceStats,
	pageStats,
	browserStats,
	deviceStats,
	audienceMix
}: DashboardProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<VisitorsChart data={dailyStats} />
			<OnlineNow count={realtimeStats?.count} visitors={realtimeStats?.visitors} deviceStats={deviceStats} />
			<TopPages data={pageStats} />
			<TopCountries data={countryStats} />
			<TopSources data={sourceStats} />
			<ReferrerPanel projectId={projectId} />
			<AudienceMix data={audienceMix} />
			<BrowserShare data={browserStats} />
			<WebVitals />
		</div>
	);
}
