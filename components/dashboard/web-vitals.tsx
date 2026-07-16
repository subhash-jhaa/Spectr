import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function WebVitals() {
	return (
		<Card className="md:col-span-2 lg:col-span-4 dark:bg-transparent">
			<CardHeader className="border-b">
				<CardTitle className="text-balance">Core Web Vitals</CardTitle>
				<CardDescription className="text-pretty">
					Field experience on real sessions, measured at the origin.
				</CardDescription>
			</CardHeader>
			<CardContent className="py-12">
				<div className="text-center text-muted-foreground font-mono text-xs max-w-md mx-auto">
					No Web Vitals telemetry received. Add the tracking script to your site header to automatically monitor Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
				</div>
			</CardContent>
		</Card>
	);
}
