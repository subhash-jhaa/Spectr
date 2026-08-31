"use client";

import React, { useEffect, useState } from "react";
import {
	BoltIcon,
	CursorArrowRaysIcon,
	ArrowsPointingOutIcon,
	InformationCircleIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	XCircleIcon,
	SparklesIcon
} from "@heroicons/react/24/outline";

interface VitalsData {
	lcp: number | null;
	inp: number | null;
	cls: number | null;
	totalSamples: number;
	ratings: {
		lcp: "good" | "needs-improvement" | "poor" | null;
		inp: "good" | "needs-improvement" | "poor" | null;
		cls: "good" | "needs-improvement" | "poor" | null;
	};
}

export function WebVitals({ projectId }: { projectId?: string }) {
	const [data, setData] = useState<VitalsData | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!projectId) return;

		let isMounted = true;
		setLoading(true);

		fetch(`/api/vitals?projectId=${encodeURIComponent(projectId)}&days=28`)
			.then((res) => (res.ok ? res.json() : null))
			.then((resData: VitalsData) => {
				if (isMounted && resData) {
					setData(resData);
				}
			})
			.catch((err) => {
				console.error("Failed to load web vitals:", err);
			})
			.finally(() => {
				if (isMounted) setLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [projectId]);

	const formatLcp = (ms: number | null) => {
		if (ms === null || ms === undefined) return null;
		return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
	};

	const formatInp = (ms: number | null) => {
		if (ms === null || ms === undefined) return null;
		return `${ms}ms`;
	};

	const formatCls = (val: number | null) => {
		if (val === null || val === undefined) return null;
		return val.toFixed(3);
	};

	const getStatusConfig = (rating: "good" | "needs-improvement" | "poor" | null) => {
		switch (rating) {
			case "good":
				return {
					label: "Good",
					badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
					icon: CheckCircleIcon,
				};
			case "needs-improvement":
				return {
					label: "Needs Work",
					badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
					icon: ExclamationTriangleIcon,
				};
			case "poor":
				return {
					label: "Poor",
					badgeColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
					icon: XCircleIcon,
				};
			default:
				return {
					label: "Collecting...",
					badgeColor: "text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
					icon: CheckCircleIcon,
				};
		}
	};

	const lcpStatus = getStatusConfig(data?.ratings?.lcp ?? null);
	const inpStatus = getStatusConfig(data?.ratings?.inp ?? null);
	const clsStatus = getStatusConfig(data?.ratings?.cls ?? null);

	const metrics = [
		{
			id: "lcp",
			title: "Loading Speed",
			tag: "LCP",
			liveValue: formatLcp(data?.lcp ?? null),
			benchmark: "Target: < 2.5s",
			statusConfig: lcpStatus,
			icon: BoltIcon,
			iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
			desc: "Measures render time of largest content element."
		},
		{
			id: "inp",
			title: "Click Response",
			tag: "INP",
			liveValue: formatInp(data?.inp ?? null),
			benchmark: "Target: < 200ms",
			statusConfig: inpStatus,
			icon: CursorArrowRaysIcon,
			iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
			desc: "Measures UI latency when users interact with page."
		},
		{
			id: "cls",
			title: "Visual Stability",
			tag: "CLS",
			liveValue: formatCls(data?.cls ?? null),
			benchmark: "Target: < 0.1",
			statusConfig: clsStatus,
			icon: ArrowsPointingOutIcon,
			iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
			desc: "Tracks layout shifts without user inputs."
		}
	];

	return (
		<div className="md:col-span-2 lg:col-span-4 bg-white/80 dark:bg-zinc-950/30 hover:bg-[#fafaf9] dark:hover:bg-zinc-950/45 transition-all duration-500 rounded-3xl p-2 border border-[#e8e6e5] dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none group relative overflow-hidden">
			{/* Inner Box */}
			<div className="rounded-[18px] bg-white dark:bg-zinc-950 border border-[#e8e6e5]/60 dark:border-zinc-800/30 p-5 sm:p-6 transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
				
				{/* Backdrop Glow Effect on Hover */}
				<div className="-bottom-32 left-[50%] -translate-x-[50%] opacity-0 group-hover:opacity-100 z-0 absolute bg-gradient-to-t from-blue-500/10 to-transparent blur-[3.5rem] rounded-full transition-all duration-500 w-48 h-48 pointer-events-none" />

				<div className="relative z-10">
					{/* Header Row */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e8e6e5]/80 dark:border-zinc-900">
						<div className="flex items-center gap-2.5">
							<div className="p-2 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 text-[#3ba6f1]">
								<SparklesIcon className="w-4 h-4" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="font-roobert text-base sm:text-lg font-semibold text-[#0c0a09] dark:text-white tracking-tight">
										Site Speed & Health
									</h3>
									<span className="text-[10px] font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-[#e8e6e5] dark:border-zinc-800">
										Core Web Vitals
									</span>
								</div>
								<p className="text-xs text-[#78716c] dark:text-zinc-400 mt-0.5">
									{data?.totalSamples && data.totalSamples > 0 
										? `P75 aggregation across ${data.totalSamples} real visitor sessions` 
										: "Live 75th percentile (P75) Real User Measurement (RUM)"}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium w-fit">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
							Live Telemetry
						</div>
					</div>

					{/* 3 Metrics Cards Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
						{metrics.map((m) => {
							const Icon = m.icon;
							const StatusIcon = m.statusConfig.icon;
							return (
								<div
									key={m.id}
									className="rounded-2xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-900/50 p-4 flex flex-col justify-between hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700/80 transition-all duration-200"
								>
									<div>
										{/* Top Row: Icon + Score Badge */}
										<div className="flex items-center justify-between mb-3">
											<div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${m.iconColor}`}>
												<Icon className="w-4 h-4" />
											</div>
											<span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${m.statusConfig.badgeColor}`}>
												<StatusIcon className="w-3 h-3" />
												{m.statusConfig.label}
											</span>
										</div>

										{/* Title + Tag */}
										<div className="flex items-baseline justify-between mb-1">
											<h4 className="font-roobert text-sm font-semibold text-[#0c0a09] dark:text-white">
												{m.title}
											</h4>
											<span className="text-[10px] font-mono font-bold text-[#78716c] dark:text-zinc-500">
												{m.tag}
											</span>
										</div>

										{/* Live Measured Value / Empty State */}
										<div className="my-2">
											{m.liveValue ? (
												<div className="font-mono text-2xl font-bold tracking-tight text-[#0c0a09] dark:text-white">
													{m.liveValue}
												</div>
											) : (
												<div className="text-xs font-mono text-[#78716c] dark:text-zinc-500 italic">
													{loading ? "Calculating..." : "Awaiting traffic..."}
												</div>
											)}
										</div>

										{/* Description */}
										<p className="text-xs text-[#78716c] dark:text-zinc-400 leading-relaxed font-sans mb-3">
											{m.desc}
										</p>
									</div>

									{/* Benchmark Target */}
									<div className="pt-2.5 border-t border-[#e8e6e5]/80 dark:border-zinc-800/60 flex items-center justify-between text-xs font-mono">
										<span className="text-[#78716c] dark:text-zinc-500 text-[11px]">Benchmark</span>
										<span className="text-[#0c0a09] dark:text-zinc-300 font-semibold text-[11px]">{m.benchmark}</span>
									</div>
								</div>
							);
						})}
					</div>

					{/* Informational 1-Line Footer */}
					<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800/60 text-[#78716c] dark:text-zinc-400 text-xs font-mono">
						<InformationCircleIcon className="w-3.5 h-3.5 text-[#3ba6f1] shrink-0" />
						<span className="truncate">
							<strong className="text-[#0c0a09] dark:text-zinc-200">SEO Impact:</strong> Google uses P75 vitals from real user traffic as an official search ranking signal.
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

