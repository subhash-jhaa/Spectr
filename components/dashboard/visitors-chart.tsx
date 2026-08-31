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

import { OverviewMetricKey } from "@/components/dashboard/overview-metrics";
import { DailyStats, OverviewMetrics as OverviewMetricsType } from "@/interfaces/database";

const chartConfig = {
	visitors: {
		label: "Unique Visitors",
		color: "#3ba6f1",
	},
	pageViews: {
		label: "Page Views",
		color: "#3ba6f1",
	},
	bounceRate: {
		label: "Bounce Rate",
		color: "#3ba6f1",
	},
} satisfies ChartConfig;

export interface VisitorsChartProps {
	data?: DailyStats[];
	activeMetric?: OverviewMetricKey;
	overviewMetrics?: OverviewMetricsType;
	delta?: number;
	isNew?: boolean;
}

export function VisitorsChart({ 
	data, 
	activeMetric = 'visitors',
	overviewMetrics,
	delta = 0, 
	isNew = false 
}: VisitorsChartProps) {
	const gradientId = `metric-area-gradient-${activeMetric}`;

  const chartDataFormatted = useMemo(() => {
    if (data && data.length > 0) {
      return data.map(d => ({
        month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: d.visitors || 0,
        pageViews: d.pageViews || 0,
        bounceRate: d.bounceRate || 0,
      }));
    }
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      result.push({
        month: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: 0,
        pageViews: 0,
        bounceRate: 0,
      });
    }
    return result;
  }, [data]);

  // Compute display values
  const currentOverviewItem = overviewMetrics?.[activeMetric];
  const activeDelta = currentOverviewItem ? currentOverviewItem.delta : delta;
  const activeIsNew = currentOverviewItem ? currentOverviewItem.isNew : isNew;

  const totalVisitors = chartDataFormatted.reduce((sum, row) => sum + row.visitors, 0);
  const totalPageViews = chartDataFormatted.reduce((sum, row) => sum + row.pageViews, 0);
  const avgBounceRate = currentOverviewItem 
    ? currentOverviewItem.current 
    : Math.round(chartDataFormatted.reduce((sum, row) => sum + row.bounceRate, 0) / Math.max(chartDataFormatted.length, 1));

  let displayTitle = "Unique Visitors";
  let displayDescription = "Total visitors in the last 7 days";
  let displayValue = formatInteger(totalVisitors);

  if (activeMetric === 'pageViews') {
    displayTitle = "Total Page Views";
    displayDescription = "Total page views in the last 7 days";
    displayValue = formatInteger(totalPageViews);
  } else if (activeMetric === 'bounceRate') {
    displayTitle = "Average Bounce Rate";
    displayDescription = "Average single-page session ratio in the last 7 days";
    displayValue = `${avgBounceRate}%`;
  }

	return (
		<Card className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm">
			<CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-2">
						<span className="text-xs sm:text-sm font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider">
							{displayTitle}
						</span>
					</div>
					<CardTitle className="font-roobert text-4xl sm:text-5xl font-bold tracking-tight text-[#0c0a09] dark:text-white tabular-nums">
						{displayValue}
					</CardTitle>
					<CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400">
						{displayDescription}
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					{activeIsNew ? (
						<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium shadow-xs">
							New
						</span>
					) : (
						<Delta value={activeDelta} variant="badge" isInverse={activeMetric === 'bounceRate'}>
							<DeltaIcon variant="trend" />
							<DeltaValue suffix="%" />
							<span className="text-[#78716c] dark:text-zinc-400 text-xs font-medium">vs prior</span>
						</Delta>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-4 pb-2">
				<ChartContainer
					id="metric-trend-chart"
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
									stopColor="#3ba6f1"
									stopOpacity={0.35}
								/>
								<stop
									offset="100%"
									stopColor="#3ba6f1"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-850 opacity-40" />
						<XAxis
							axisLine={false}
							dataKey="month"
							tickFormatter={(value) => String(value).slice(0, 6)}
							tickLine={false}
							tickMargin={10}
							stroke="currentColor"
							className="text-[#78716c] dark:text-zinc-300 font-mono font-medium"
							fontSize={13}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent 
									indicator="line" 
									formatter={(val) => activeMetric === 'bounceRate' ? `${val}%` : formatInteger(Number(val))}
								/>
							}
							cursor={{
								stroke: "#3ba6f1",
								strokeDasharray: "3 3",
								strokeLinecap: "round",
							}}
							wrapperStyle={{ outline: "none" }}
						/>
						<Area
							dataKey={activeMetric}
							dot={{
								fill: "#3ba6f1",
								r: 3,
								strokeWidth: 2,
								stroke: "#ffffff",
							}}
							activeDot={{
								fill: "#ffffff",
								r: 5,
								strokeWidth: 2,
								stroke: "#3ba6f1",
							}}
							fill={`url(#${gradientId})`}
							isAnimationActive={true}
							name={String(chartConfig[activeMetric]?.label || "Value")}
							stroke="#3ba6f1"
							strokeWidth={2}
							type="linear"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
