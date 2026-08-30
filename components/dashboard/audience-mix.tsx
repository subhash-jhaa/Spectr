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
	data?: {
		newVisitors: number;
		returningVisitors: number;
		newShare: number;
		returningShare: number;
	};
}

export function AudienceMix({ data }: AudienceMixProps) {
	const total = (data?.newVisitors || 0) + (data?.returningVisitors || 0);
	const segments = total > 0 ? [
		{ label: `New (${data?.newVisitors || 0})`, share: data?.newShare ?? 0 },
		{ label: `Returning (${data?.returningVisitors || 0})`, share: data?.returningShare ?? 0 },
	] : [];

	return (
		<Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
			<div>
				<CardHeader className="pb-3 border-b border-zinc-900/80">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base font-bold font-mono tracking-tight text-white">Audience Mix</CardTitle>
							<CardDescription className="text-xs font-mono text-zinc-500 mt-0.5">
								New vs returning visitor distribution
							</CardDescription>
						</div>
						<div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800/60 px-2 py-0.5 rounded">
							Last 30d
						</div>
					</div>
				</CardHeader>
				<CardContent className="px-4 py-4">
					{segments.length > 0 ? (
						<ShareBarList aria-label="Audience segments by share of sessions">
							{segments.map((row) => (
								<ShareBarListItem key={row.label} value={row.share}>
									<ShareBarListContent>
										<ShareBarListLabel className="text-xs font-mono text-zinc-300">{row.label}</ShareBarListLabel>
										<ShareBarListValue className="text-xs font-mono text-zinc-400 font-semibold">{row.share}%</ShareBarListValue>
									</ShareBarListContent>
									<ShareBarListFill />
								</ShareBarListItem>
							))}
						</ShareBarList>
					) : (
						<div className="text-center py-10 text-zinc-500 font-mono text-xs">
							No audience telemetry recorded yet
						</div>
					)}
				</CardContent>
			</div>
		</Card>
	);
}
