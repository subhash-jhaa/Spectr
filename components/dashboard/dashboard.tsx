import { AudienceMix } from "@/components/dashboard/audience-mix";
import { BrowserShare } from "@/components/dashboard/browser-share";
import { OnlineNow } from "@/components/dashboard/online-now";
import { TopCountries } from "@/components/dashboard/top-countries";
import { TopPages } from "@/components/dashboard/top-pages";
import { TopReferrers } from "@/components/dashboard/top-referrers";
import { TrafficSourcesChart } from "@/components/dashboard/traffic-sources-chart";
import { VisitorsChart } from "@/components/dashboard/visitors-chart";
import { WebVitals } from "@/components/dashboard/web-vitals";

export interface DashboardProps {
	dailyStats?: { date: string; visitors: number }[];
	realtimeStats?: { count: number; visitors: { id: string; pageUrl: string; referrer: string; country: string; city: string; userAgent: string; timestamp: string }[] };
	countryStats?: { country: string; visitors: number }[];
	referrerStats?: { referrer: string; visitors: number }[];
	pageStats?: { pageUrl: string; visitors: number; pageViews: number }[];
	browserStats?: { browser: string; visitors: number; share: number }[];
	deviceStats?: { device: string; share: number }[];
}

export function Dashboard({ dailyStats, realtimeStats, countryStats, referrerStats, pageStats, browserStats, deviceStats }: DashboardProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<VisitorsChart data={dailyStats} />
			<OnlineNow count={realtimeStats?.count} visitors={realtimeStats?.visitors} deviceStats={deviceStats} />
			<TopPages data={pageStats} />
			<TopCountries data={countryStats} />
			<TrafficSourcesChart referrers={referrerStats} />
			<AudienceMix visitors={realtimeStats?.visitors} />
			<BrowserShare data={browserStats} />
			<TopReferrers data={referrerStats} />
			<WebVitals />
		</div>
	);
}
