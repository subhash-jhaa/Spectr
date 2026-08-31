"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ShareBarList,
	ShareBarListContent,
	ShareBarListFill,
	ShareBarListItem,
	ShareBarListLabel,
	ShareBarListValue,
} from "@/components/dashboard/share-bar-list";

export interface OnlineNowProps {
	count?: number;
	visitors?: { userAgent: string }[];
	deviceStats?: { device: string; share: number }[];
}

const getDeviceType = (ua: string) => {
	const lowercaseUa = ua.toLowerCase();
	if (/mobile|android|iphone|phone/i.test(lowercaseUa)) return "Mobile";
	if (/tablet|ipad/i.test(lowercaseUa)) return "Tablet";
	return "Desktop";
};

export function OnlineNow({ count = 0, visitors = [], deviceStats = [] }: OnlineNowProps) {
	const totalOnline = count || visitors.length || 0;

	// realtime when someone is live, historical otherwise
	const deviceShares = totalOnline > 0
		? (["Mobile", "Desktop", "Tablet"] as const).map((label) => {
				const matchCount = visitors.filter((v) => getDeviceType(v.userAgent || "") === label).length;
				return {
					label,
					share: Math.round((matchCount / totalOnline) * 100),
				};
			})
		: deviceStats.length > 0
			? deviceStats.map((d) => ({ label: d.device, share: d.share }))
			: [
					{ label: "Mobile" as const, share: 0 },
					{ label: "Desktop" as const, share: 0 },
					{ label: "Tablet" as const, share: 0 },
				];

	return (
		<Card className="gap-0 pb-0 md:col-span-2 lg:col-span-1 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm flex flex-col justify-between">
			<CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80">
				<div className="flex min-w-0 flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<span className="text-xs sm:text-sm font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider">Active Now</span>
					</div>
					<div className="flex items-center gap-3">
						<CardTitle className="font-roobert text-4xl sm:text-5xl font-bold tracking-tight text-[#0c0a09] dark:text-white tabular-nums">{totalOnline}</CardTitle>
						<span className="relative flex h-3 w-3">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
						</span>
					</div>
					<CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400">
						Live visitors on site
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="px-5 py-4">
				<div className="text-xs font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider mb-3">Device Distribution</div>
				<ShareBarList>
					{deviceShares.map((d) => (
						<ShareBarListItem key={d.label} value={d.share}>
							<ShareBarListContent>
								<ShareBarListLabel className="text-xs sm:text-sm font-medium text-[#0c0a09] dark:text-zinc-200">{d.label}</ShareBarListLabel>
								<ShareBarListValue className="text-xs sm:text-sm font-medium text-[#78716c] dark:text-zinc-400">{d.share}%</ShareBarListValue>
							</ShareBarListContent>
							<ShareBarListFill data-online-bar />
						</ShareBarListItem>
					))}
				</ShareBarList>
			</CardContent>
		</Card>
	);
}
