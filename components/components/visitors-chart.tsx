"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { formatInteger } from "@/components/components/formater";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/components/delta";



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
	const gradientId = `visitors-area-${useId().replace(/:/g, "")}`;

  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        month: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: 0
      });
    }
    return result;
  };

  const chartDataFormatted = data && data.length > 0
    ? data.map(d => ({
        month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: d.visitors
      }))
    : getLast7Days();

  const total = chartDataFormatted.reduce((sum, row) => sum + row.visitors, 0);

	return (
		<Card className="md:col-span-2 lg:col-span-3 dark:bg-transparent">
			<CardHeader className="flex flex-row items-start justify-between">
				<div className="flex flex-col gap-1.5">
					<CardTitle className="font-mono text-2xl tabular-nums">
						{formatInteger(total)}
					</CardTitle>
					<CardDescription className="text-pretty">
						Total visitors in the last 7 days.
					</CardDescription>
				</div>
				<Delta value={0.0} variant="badge">
					<DeltaIcon variant="trend" />
					<DeltaValue suffix="%" />
					<span>vs prior period</span>
				</Delta>
			</CardHeader>
			<CardContent>
				<ChartContainer
					className="aspect-auto h-60 w-full"
					config={chartConfig}
				>
					<AreaChart
						accessibilityLayer
						data={chartDataFormatted}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<defs>
							<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="0%"
									stopColor="var(--color-visitors)"
									stopOpacity={0.35}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-visitors)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="month"
							tickFormatter={(value) => String(value).slice(0, 3)}
							tickLine={false}
							tickMargin={8}
						/>
						<ChartTooltip
							content={<ChartTooltipContent indicator="dashed" />}
							cursor={{
								stroke: "var(--color-visitors)",
								strokeDasharray: "3 3",
								strokeLinecap: "round",
							}}
							wrapperStyle={{ outline: "none" }}
						/>
						<Area
							dataKey="visitors"
							dot={{
								fill: "var(--color-visitors)",
								r: 2.5,
								strokeWidth: 2,
							}}
							fill={`url(#${gradientId})`}
							isAnimationActive={false}
							name={chartConfig.visitors.label}
							stroke="var(--color-visitors)"
							strokeWidth={2}
							type="linear"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
