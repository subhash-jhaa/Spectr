"use client";

import { cn } from "@/components/lib/utils";
import { Button } from "@/components/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/components/ui/tooltip";
import { StatusIndicator } from "@/components/components/../../components/indicator";
import { Delta, DeltaIcon, DeltaValue } from "@/components/components/delta";
import {
	ShareBarList,
	ShareBarListContent,
	ShareBarListFill,
	ShareBarListItem,
	ShareBarListLabel,
	ShareBarListValue,
} from "@/components/components/share-bar-list";

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
		<Card className="gap-0 pb-0 md:col-span-2 lg:col-span-1 dark:bg-transparent">
			<CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
				<div className="flex min-w-0 flex-col gap-0">
					<CardTitle className="font-mono text-2xl tabular-nums">{totalOnline}</CardTitle>
					<CardDescription>
						<Tooltip>
							<TooltipTrigger render={<Button className={cn(
																	"cursor-help px-1 py-px font-normal text-muted-foreground",
																	"hover:underline-0"
																)} type="button" variant="link" />}><StatusIndicator /><span>visitors online</span></TooltipTrigger>
							<TooltipContent side="bottom">
								Active visitors right now.
							</TooltipContent>
						</Tooltip>
					</CardDescription>
				</div>
				<Delta value={0.0} variant="badge">
					<DeltaIcon variant="trend" />
					<DeltaValue suffix="%" />
				</Delta>
			</CardHeader>
			<CardContent
				className={cn("relative flex h-full items-center px-0 py-2")}
			>
				<ShareBarList>
					{deviceShares.map((d) => (
						<ShareBarListItem key={d.label} value={d.share}>
							<ShareBarListContent>
								<ShareBarListLabel>{d.label}</ShareBarListLabel>
								<ShareBarListValue>{d.share}%</ShareBarListValue>
							</ShareBarListContent>
							<ShareBarListFill data-online-bar />
						</ShareBarListItem>
					))}
				</ShareBarList>
			</CardContent>
		</Card>
	);
}
