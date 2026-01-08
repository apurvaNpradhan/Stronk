import { IconArrowLeft, IconUser, IconSettings2, IconShieldLock } from "@tabler/icons-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useRouteActive } from "@/hooks/use-active-route";

export function SettingSidebar({  
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const isActive = useRouteActive();
	const router = useRouter();
	const onBack = () => {
		router.navigate({ to: "/dashboard" });
	};
	const navigate = useNavigate();
	return (
		<Sidebar collapsible="offExamples" variant="inset" {...props}>
			<SidebarHeader className="px-0">
				<SidebarMenuButton
					onClick={() => {
						onBack();
					}}
				>
					<IconArrowLeft />
					<span>Back to app</span>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="p-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/settings/account/preferences")}
							onClick={() =>
								navigate({
									to: "/settings/account/preferences",
								})
							}
						>
							<IconSettings2 />
							Preferences
						</SidebarMenuButton>
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/settings/account/profile")}
							onClick={() =>
								navigate({
									to: "/settings/account/profile",
								})
							}
						>
							<IconUser />
							Profile
						</SidebarMenuButton>
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/settings/account/security")}
							onClick={() =>
								navigate({
									to: "/settings/account/security",
								})
							}
						>
							<IconShieldLock />
							Security
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
