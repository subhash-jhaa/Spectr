"use client";

import { formatCompactNumber } from "@/components/dashboard/formater";
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



export interface TrafficSourcesChartProps {
	referrers?: { referrer: string; visitors: number }[];
}

export function TrafficSourcesChart({ referrers }: TrafficSourcesChartProps) {
	const mappedData = referrers && referrers.length > 0
		? referrers.map(r => ({
				source: r.referrer || "Direct",
				sessions: r.visitors
			}))
		: [];


	return (
		<Card className="dark:bg-transparent">
			<CardHeader className="border-b">
				<CardTitle className="text-balance">Sessions by source</CardTitle>
				<CardDescription className="text-pretty">
					Attributed sessions in the selected period.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0 py-1">
				{mappedData.length > 0 ? (
					<ShareBarList aria-label="Sessions by traffic source">
						{mappedData.map((row) => (
							<ShareBarListItem
								key={row.source}
								value={(row.sessions / Math.max(...mappedData.map((d) => d.sessions), 1)) * 75}
							>
								<ShareBarListContent>
									<ShareBarListLabel>{row.source}</ShareBarListLabel>
									<ShareBarListValue>
										{formatCompactNumber(row.sessions)}
									</ShareBarListValue>
								</ShareBarListContent>
								<ShareBarListFill />
							</ShareBarListItem>
						))}
					</ShareBarList>
				) : (
					<div className="text-center py-8 text-muted-foreground font-mono text-xs">
						No traffic sources.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
