import { createFileRoute } from "@tanstack/react-router";
import SettingLayout from "@/components/layout/setting-layout";
import { ProfileForm } from "@/features/settings/components/profile-form";

export const Route = createFileRoute("/(authenicated)/settings/account/profile/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				name: "description",
				content: "Profile",
			},
			{
				title: "Profile",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<SettingLayout>
			<div className="mx-auto mt-15 flex max-w-4xl flex-col gap-7 p-6">
				<span className="font-semibold text-3xl">Profile</span>
				<ProfileForm />
			</div>
		</SettingLayout>
	);
}
