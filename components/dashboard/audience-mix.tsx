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
		<Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
			<div>
				<CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg sm:text-xl font-bold font-roobert tracking-tight text-[#0c0a09] dark:text-white">Audience Mix</CardTitle>
							<CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-0.5">
								New vs returning visitor distribution
							</CardDescription>
						</div>
						<div className="text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900/70 border border-[#e8e6e5] dark:border-zinc-800/60 px-2.5 py-0.5 rounded-lg">
							Last 30d
						</div>
					</div>
				</CardHeader>
				<CardContent className="px-5 py-4">
					{segments.length > 0 ? (
						<ShareBarList aria-label="Audience segments by share of sessions">
							{segments.map((row) => (
								<ShareBarListItem key={row.label} value={row.share}>
									<ShareBarListContent>
										<ShareBarListLabel className="text-xs sm:text-sm font-medium text-[#0c0a09] dark:text-zinc-200">{row.label}</ShareBarListLabel>
										<ShareBarListValue className="text-xs sm:text-sm font-semibold text-[#78716c] dark:text-zinc-400">{row.share}%</ShareBarListValue>
									</ShareBarListContent>
									<ShareBarListFill />
								</ShareBarListItem>
							))}
						</ShareBarList>
					) : (
						<div className="text-center py-10 text-[#a8a29e] dark:text-zinc-500 font-mono text-xs">
							No audience telemetry recorded yet
						</div>
					)}
				</CardContent>
			</div>
		</Card>
	);
}
