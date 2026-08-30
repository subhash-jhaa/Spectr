import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BoltIcon,
	CursorArrowRaysIcon,
	ArrowsPointingOutIcon,
	InformationCircleIcon,
	CheckCircleIcon
} from "@heroicons/react/24/outline";

export function WebVitals() {
	const metrics = [
		{
			id: "lcp",
			title: "Loading Speed",
			technicalName: "Largest Contentful Paint (LCP)",
			target: "Fast (< 2.5s)",
			status: "Good",
			badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
			icon: BoltIcon,
			iconColor: "text-amber-400 bg-amber-950/30 border-amber-500/20",
			simpleExplanation: "How quickly your main text, images, and content appear for visitors.",
			whyItMatters: "Faster loads prevent users from bouncing before seeing your page."
		},
		{
			id: "inp",
			title: "Click Responsiveness",
			technicalName: "Interaction to Next Paint (INP)",
			target: "Instant (< 200ms)",
			status: "Good",
			badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
			icon: CursorArrowRaysIcon,
			iconColor: "text-blue-400 bg-blue-950/30 border-blue-500/20",
			simpleExplanation: "How fast buttons, menus, and links react when a user clicks or taps them.",
			whyItMatters: "Eliminates frustrating UI lag and keeps interactions snappy."
		},
		{
			id: "cls",
			title: "Visual Stability",
			technicalName: "Cumulative Layout Shift (CLS)",
			target: "Smooth (< 0.1)",
			status: "Good",
			badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
			icon: ArrowsPointingOutIcon,
			iconColor: "text-purple-400 bg-purple-950/30 border-purple-500/20",
			simpleExplanation: "Ensures the layout stays solid without elements jumping around as it loads.",
			whyItMatters: "Prevents accidental misclicks caused by shifting content."
		}
	];

	return (
		<Card className="md:col-span-2 lg:col-span-4 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden">
			<CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<CardTitle className="text-lg sm:text-xl font-bold font-sans tracking-tight text-[#0c0a09] dark:text-white">
								Site Speed & Health
							</CardTitle>
							<span className="text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-[#e8e6e5] dark:border-zinc-800">
								Google Core Web Vitals
							</span>
						</div>
						<CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-1">
							Google&apos;s 3 official metrics measuring real user speed, responsiveness, and stability
						</CardDescription>
					</div>
					<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold w-fit">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
						Live Monitoring
					</div>
				</div>
			</CardHeader>
			
			<CardContent className="p-4 sm:p-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{metrics.map((m) => {
						const Icon = m.icon;
						return (
							<div
								key={m.id}
								className="bg-[#fafaf9] dark:bg-zinc-900/40 border border-[#e8e6e5] dark:border-zinc-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700/60 transition-colors"
							>
								<div>
									{/* Top Header Row */}
									<div className="flex items-center justify-between mb-3">
										<div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${m.iconColor}`}>
											<Icon className="w-4 h-4" />
										</div>
										<span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${m.badgeColor}`}>
											<CheckCircleIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
											{m.status}
										</span>
									</div>

									{/* Main Simple Title & Technical Subtitle */}
									<h4 className="text-base font-bold font-sans text-[#0c0a09] dark:text-white tracking-tight">
										{m.title}
									</h4>
									<p className="text-[11px] font-mono text-[#78716c] dark:text-zinc-400 mb-2 font-medium">
										{m.technicalName}
									</p>

									{/* Easy to understand explanation */}
									<p className="text-sm text-[#0c0a09] dark:text-zinc-300 leading-relaxed font-sans mb-2">
										{m.simpleExplanation}
									</p>
									<p className="text-xs text-[#78716c] dark:text-zinc-400 leading-normal font-sans">
										{m.whyItMatters}
									</p>
								</div>

								{/* Benchmark Target */}
								<div className="mt-4 pt-3 border-t border-[#e8e6e5] dark:border-zinc-800/50 flex items-center justify-between text-xs font-mono">
									<span className="text-[#78716c] dark:text-zinc-400">Google Benchmark:</span>
									<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{m.target}</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* Informational Bottom Helper Banner */}
				<div className="flex items-start sm:items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900/30 border border-[#e8e6e5] dark:border-zinc-800/40 text-[#78716c] dark:text-zinc-400 text-xs font-mono">
					<InformationCircleIcon className="w-4 h-4 text-[#3ba6f1] shrink-0 mt-0.5 sm:mt-0" />
					<p className="leading-normal">
						<strong className="text-[#0c0a09] dark:text-zinc-200">Why this matters:</strong> Google uses these 3 signals to rank your site in search results. Higher scores lead to better SEO rankings and higher visitor conversion rates.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
