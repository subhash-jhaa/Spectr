import { AudienceMix } from "@/components/components/audience-mix";
import { BrowserShare } from "@/components/components/browser-share";
import { OnlineNow } from "@/components/components/online-now";
import { TopCountries } from "@/components/components/top-countries";
import { TopPages } from "@/components/components/top-pages";
import { TopReferrers } from "@/components/components/top-referrers";
import { TrafficSourcesChart } from "@/components/components/traffic-sources-chart";
import { VisitorsChart } from "@/components/components/visitors-chart";
import { WebVitals } from "@/components/components/web-vitals";

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
