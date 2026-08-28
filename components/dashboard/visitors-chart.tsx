'use client';

import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { formatInteger } from "@/components/dashboard/formater";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/dashboard/delta";

const chartConfig = {
	visitors: {
		label: "Visitors",
		color: "#0062ff",
	},
} satisfies ChartConfig;

export interface VisitorsChartProps {
	data?: { date: string; visitors: number }[];
}

export function VisitorsChart({ data }: VisitorsChartProps) {
	const gradientId = "visitors-area-gradient";

  const chartDataFormatted = useMemo(() => {
    if (data && data.length > 0) {
      return data.map(d => ({
        month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: d.visitors
      }));
    }
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      result.push({
        month: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: 0
      });
    }
    return result;
  }, [data]);

  const total = chartDataFormatted.reduce((sum, row) => sum + row.visitors, 0);

	return (
		<Card className="md:col-span-2 lg:col-span-3 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm">
			<CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-zinc-900/80">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">Unique Visitors</span>
					</div>
					<CardTitle className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
						{formatInteger(total)}
					</CardTitle>
					<CardDescription className="text-xs font-mono text-zinc-500">
						Total visitors in the last 7 days
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Delta value={0.0} variant="badge">
						<DeltaIcon variant="trend" />
						<DeltaValue suffix="%" />
						<span className="text-zinc-500">vs prior</span>
					</Delta>
				</div>
			</CardHeader>
			<CardContent className="pt-4 pb-2">
				<ChartContainer
					id="visitors-chart"
					className="aspect-auto h-60 w-full"
					config={chartConfig}
				>
					<AreaChart
						accessibilityLayer
						data={chartDataFormatted}
						margin={{
							left: 8,
							right: 8,
							top: 8,
							bottom: 0,
						}}
					>
						<defs>
							<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="0%"
									stopColor="#0062ff"
									stopOpacity={0.35}
								/>
								<stop
									offset="100%"
									stopColor="#0062ff"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
						<XAxis
							axisLine={false}
							dataKey="month"
							tickFormatter={(value) => String(value).slice(0, 6)}
							tickLine={false}
							tickMargin={10}
							stroke="rgba(255,255,255,0.4)"
							fontSize={11}
							fontFamily="monospace"
						/>
						<ChartTooltip
							content={<ChartTooltipContent indicator="line" />}
							cursor={{
								stroke: "#0062ff",
								strokeDasharray: "3 3",
								strokeLinecap: "round",
							}}
							wrapperStyle={{ outline: "none" }}
						/>
						<Area
							dataKey="visitors"
							dot={{
								fill: "#0062ff",
								r: 3,
								strokeWidth: 2,
								stroke: "#09090b",
							}}
							activeDot={{
								fill: "#ffffff",
								r: 5,
								strokeWidth: 2,
								stroke: "#0062ff",
							}}
							fill={`url(#${gradientId})`}
							isAnimationActive={true}
							name={chartConfig.visitors.label}
							stroke="#0062ff"
							strokeWidth={2}
							type="linear"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
