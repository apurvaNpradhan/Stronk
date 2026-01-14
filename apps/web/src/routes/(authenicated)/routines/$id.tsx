import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenicated)/routines/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(authenicated)/routines/$id"!</div>;
}
