import { createFileRoute } from "@tanstack/react-router";
import SettingLayout from "@/components/layout/setting-layout";
import { SecurityForm } from "@/features/settings/components/security-form";

export const Route = createFileRoute("/(authenicated)/settings/account/security/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				name: "description",
				content: "Security",
			},
			{
				title: "Security",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<SettingLayout>
			<div className="mx-auto mt-15 flex max-w-4xl flex-col gap-7 p-6">
				<span className="font-bold text-3xl">Security</span>
				<SecurityForm />
			</div>
		</SettingLayout>
	);
}
