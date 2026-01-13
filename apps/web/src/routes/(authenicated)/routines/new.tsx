import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/app-layout";
import NewRoutine from "@/features/routine/components/new";

export const Route = createFileRoute("/(authenicated)/routines/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout>
			<NewRoutine />
		</MainLayout>
	);
}
