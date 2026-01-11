import { IconDashboard } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteActive } from "@/hooks/use-active-route";
import { sessionQueryOptions } from "@/lib/auth-client";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const isActive = useRouteActive();
	const navigate = useNavigate();
	return (
		<Sidebar collapsible="icon" {...props} variant="inset">
			<SidebarHeader className="p-0">
				{!session?.data ? (
					<Skeleton className="h-12 w-full" />
				) : (
					<NavUser user={session?.data?.user} />
				)}
			</SidebarHeader>
			<SidebarContent className="mt-5 flex flex-col gap-5 text-muted-foreground">
				<SidebarGroup className="p-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/dashboard")}
							onClick={() => navigate({ to: "/dashboard" })}
						>
							<IconDashboard />
							Dashboard
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="flex items-center" />
		</Sidebar>
	);
}
