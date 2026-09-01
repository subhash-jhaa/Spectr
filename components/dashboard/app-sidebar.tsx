"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/dashboard/logo";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { AppSearch } from "@/components/dashboard/app-search";
import { navGroups } from "@/components/dashboard/app-shared";
import { CustomTrigger } from "@/components/dashboard/custom-trigger";
import { LatestChange } from "@/components/dashboard/latest-change";
import { SettingsIcon } from "lucide-react";

export function AppSidebar() {
	return (
		<Sidebar
			className={cn(
				"*:data-[slot=sidebar-inner]:bg-background",
				"transition-[left,right,top,width] group-data-[collapsible=icon]:top-[calc(var(--app-header-height)*0.5)]"
			)}
			collapsible="icon"
			variant="sidebar"
		>
			<SidebarHeader className="h-(--app-header-height,3rem) flex-row items-center justify-between">
				<Button variant="ghost" render={<Link href="/dashboard" />} nativeButton={false} className="gap-2.5 px-2">
					<LogoIcon className="w-5 h-5 text-foreground" />
					<span className="font-bold tracking-tight text-foreground">Spectr</span>
				</Button>
				<CustomTrigger place="sidebar" />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<AppSearch />
				</SidebarGroup>
				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
							{group.label}
						</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton isActive={item.isActive} tooltip={item.title} render={<a href={item.path} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter className="px-4">
				<LatestChange />
				<div className="flex items-center pt-4 pb-2">
					<Button className="text-muted-foreground" size="icon-sm" variant="ghost" render={<a aria-label="Settings" href="#" />} nativeButton={false}><SettingsIcon
                    							/></Button>
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
