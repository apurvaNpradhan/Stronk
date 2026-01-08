import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
	ItemDescription,
	ItemMedia,
} from "@/components/ui/item";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
import {
	IconBrandAndroid,
	IconBrandApple,
	IconBrandChrome,
	IconBrandEdge,
	IconBrandFirefox,
	IconBrandOpera,
	IconBrandSafari,
	IconBrandUbuntu,
	IconBrandWindows,
	IconDeviceDesktop,
	IconDeviceMobile,
	IconDeviceTablet,
	IconLoader2,
	IconLogout
} from "@tabler/icons-react";

function getBrowserInformation(userAgent: string) {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();
	
	if (!result.browser.name && !result.os.name) {
		return "Unknown Device";
	}
	
	if (!result.browser.name) return result.os.name || "Unknown OS";
	if (!result.os.name) return result.browser.name || "Unknown Browser";
	
	return `${result.browser.name} on ${result.os.name}`;
}

function getDeviceIcon(userAgent: string) {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();
	const browserName = result.browser.name?.toLowerCase() || "";
	const osName = result.os.name?.toLowerCase() || "";

	if (browserName.includes("chrome")) return <IconBrandChrome className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (browserName.includes("firefox")) return <IconBrandFirefox className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (browserName.includes("safari")) return <IconBrandSafari className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (browserName.includes("edge")) return <IconBrandEdge className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (browserName.includes("opera")) return <IconBrandOpera className="bg-accent rounded-md p-1 size-8 text-primary/60" />;

	if (osName.includes("windows")) return <IconBrandWindows className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (osName.includes("mac") || osName.includes("ios")) return <IconBrandApple className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (osName.includes("linux") || osName.includes("ubuntu")) return <IconBrandUbuntu className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (osName.includes("android")) return <IconBrandAndroid className="bg-accent rounded-md p-1 size-8 text-primary/60" />;

	if (result.device.type === "mobile") return <IconDeviceMobile className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	if (result.device.type === "tablet") return <IconDeviceTablet className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
	return <IconDeviceDesktop className="bg-accent rounded-md p-1 size-8 text-primary/60" />;
}

function SessionManagement() {
	const queryClient = useQueryClient();
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	
	const { data: sessions, isLoading } = useQuery({
		queryKey: ["auth-sessions"],
		queryFn: async () => {
			const { data, error } = await authClient.listSessions();
			if (error) throw error;
			return data;
		},
	});

	const revokeMutation = useMutation({
		mutationFn: async (token: string) => {
			const { error } = await authClient.revokeSession({
				token,
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Session revoked");
			queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to revoke session");
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<IconLoader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const currentSessionToken = session?.data?.session?.token;
	const currentSession = sessions?.find(s => s.token === currentSessionToken);
	const otherSessions = sessions?.filter(s => s.token !== currentSessionToken) || [];
	const sortedSessions = currentSession ? [currentSession, ...otherSessions] : otherSessions;

	return (
		<ItemGroup>
			{sortedSessions.map((s) => {
				const isCurrent = s.token === currentSessionToken;
				const info = getBrowserInformation(s.userAgent || "");
				
				return (
					<Item className="group rounded-md"  variant={"muted"} key={s.id}>
						<ItemMedia>
							<div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
								{getDeviceIcon(s.userAgent || "")}
							</div>
						</ItemMedia>
						<ItemContent className="gap-1">
							<ItemTitle className="flex items-center gap-2 font-medium text-sm text-foreground">
								{info}
							</ItemTitle>
							<div className="flex items-center gap-2 text-xs mt-2">
								{isCurrent && (
									<Status variant="success">
										<StatusIndicator />
										<StatusLabel>Active Now</StatusLabel>
									</Status>
								)}
								<span className="text-muted-foreground">
									{s.ipAddress || "Unknown IP"}
								</span>
							</div>
						</ItemContent>
						<ItemActions>
							{!isCurrent && (
								<Button 
									variant="ghost" 
									size="icon" 
									className="rounded-full text-destructive transition-opacity opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
									onClick={() => revokeMutation.mutate(s.token)}
									disabled={revokeMutation.isPending}
								>
									<IconLogout className="size-4" />
								</Button>
							)}
						</ItemActions>
					</Item>
				);
			})}
		</ItemGroup>
	);
}

export function SecurityForm() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="font-bold text-xl">Sessions</h2>
				<p className="text-muted-foreground text-sm">Devices logged into your account.</p>
			</div>

			<SessionManagement />
		</div>
	);
}

