import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MainLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NewRoutineForm from "@/features/routine/components/new-routine-form";

export const Route = createFileRoute("/(authenicated)/routines/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout header={<Header />}>
			<div className="mx-auto max-w-5xl px-4">
				<NewRoutineForm />
			</div>
		</MainLayout>
	);
}

function Header() {
	const navigate = useNavigate();
	return (
		<div className="flex w-full items-center justify-between px-4 py-2">
			<div className="flex items-center justify-start gap-2">
				<SidebarTrigger />
				<div className="flex items-center gap-2 text-xs">
					<Button
						variant={"ghost"}
						size="xs"
						className={"p-1"}
						onClick={() => navigate({ to: "/routines" })}
					>
						Routines
					</Button>
					<Button variant={"outline"} size={"xs"} className="font-semibold">
						New routine
					</Button>
				</div>
			</div>
		</div>
	);
}
