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



export interface AudienceMixProps {
	visitors?: { id: string }[];
}

export function AudienceMix({ visitors = [] }: AudienceMixProps) {
	const total = visitors.length;
	const segments = total > 0 ? [
		{ label: "New visitors", share: 100 },
		{ label: "Returning visitors", share: 0 },
	] : [];

	return (
		<Card className="dark:bg-transparent">
			<CardHeader className="border-b">
				<CardTitle className="text-balance">Audience mix</CardTitle>
				<CardDescription className="text-pretty">
					Session split by familiarity in the last 12 months.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0 py-1">
				{segments.length > 0 ? (
					<ShareBarList aria-label="Audience segments by share of sessions">
						{segments.map((row) => (
							<ShareBarListItem key={row.label} value={row.share}>
								<ShareBarListContent>
									<ShareBarListLabel>{row.label}</ShareBarListLabel>
									<ShareBarListValue>{row.share}%</ShareBarListValue>
								</ShareBarListContent>
								<ShareBarListFill />
							</ShareBarListItem>
						))}
					</ShareBarList>
				) : (
					<div className="text-center py-8 text-muted-foreground font-mono text-xs">
						No audience data.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
