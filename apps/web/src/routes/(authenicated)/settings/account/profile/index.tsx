import { createFileRoute } from "@tanstack/react-router";
import SettingLayout from "@/components/layout/setting-layout";
import Modal from "@/components/ui/modal";
import { AccountSettingsPage } from "@/features/settings/components/account-settings-page";
import { ChangeEmailModal } from "@/features/settings/components/change-email-modal";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";
import { UpdatePasswordModal } from "@/features/settings/components/update-password-modal";
import { useModal } from "@/stores/modal.store";

export const Route = createFileRoute(
	"/(authenicated)/settings/account/profile/",
)({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				name: "description",
				content: "Account Settings",
			},
			{
				title: "Account Settings",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<>
			<SettingModals />
			<SettingLayout>
				<div className="mx-auto mt-15 flex max-w-4xl flex-col gap-7 p-6">
					<span className="font-semibold text-3xl">Account Settings</span>
					<AccountSettingsPage />
				</div>
			</SettingLayout>
		</>
	);
}

function SettingModals() {
	const { isOpen, modalContentType } = useModal();

	return (
		<>
			<Modal
				modalSize="sm"
				isVisible={isOpen && modalContentType === "UPDATE_PASSWORD"}
			>
				<UpdatePasswordModal />
			</Modal>

			<Modal
				modalSize="md"
				isVisible={isOpen && modalContentType === "DELETE_USER"}
			>
				<DeleteAccountModal />
			</Modal>

			<Modal
				modalSize="sm"
				isVisible={isOpen && modalContentType === "UPDATE_EMAIL"}
			>
				<ChangeEmailModal />
			</Modal>
		</>
	);
}
