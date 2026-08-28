"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/dashboard/delta";
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
		<Card className="gap-0 pb-0 md:col-span-2 lg:col-span-1 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm flex flex-col justify-between">
			<CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-zinc-900/80">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">Active Now</span>
					</div>
					<div className="flex items-center gap-2.5">
						<CardTitle className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">{totalOnline}</CardTitle>
						<span className="relative flex h-2.5 w-2.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
						</span>
					</div>
					<CardDescription className="text-xs font-mono text-zinc-500">
						Live visitors on site
					</CardDescription>
				</div>
				<Delta value={0.0} variant="badge">
					<DeltaIcon variant="trend" />
					<DeltaValue suffix="%" />
				</Delta>
			</CardHeader>
			<CardContent className="px-4 py-4">
				<div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2.5">Device Distribution</div>
				<ShareBarList>
					{deviceShares.map((d) => (
						<ShareBarListItem key={d.label} value={d.share}>
							<ShareBarListContent>
								<ShareBarListLabel className="text-xs font-mono text-zinc-300">{d.label}</ShareBarListLabel>
								<ShareBarListValue className="text-xs font-mono text-zinc-400">{d.share}%</ShareBarListValue>
							</ShareBarListContent>
							<ShareBarListFill data-online-bar />
						</ShareBarListItem>
					))}
				</ShareBarList>
			</CardContent>
		</Card>
	);
}
