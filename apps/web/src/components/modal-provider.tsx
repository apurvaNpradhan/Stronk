import { useQuery } from "@tanstack/react-query";
import type * as React from "react";
import { ForgotPasswordModal } from "@/features/auth/components/forgot-password-modal";
import { ChangeEmailModal } from "@/features/settings/components/change-email-modal";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";
import { UpdatePasswordModal } from "@/features/settings/components/update-password-modal";
import { type ModalType, useModal } from "@/stores/modal.store";
import { orpc } from "@/utils/orpc";
import Modal from "./ui/modal";

export function ModalProvider() {
	const modal = useModal();
	const ModalRegistry: Record<ModalType, React.ComponentType<any>> = {
		UPDATE_PASSWORD: UpdatePasswordModal,
		DELETE_ACCOUNT: DeleteAccountModal,
		UPDATE_EMAIL: ChangeEmailModal,
		FORGOT_PASSWORD: ForgotPasswordModal,
		EXERCISE_DETAIL: ({ exercisePublicId }: { exercisePublicId: string }) => (
			<ExerciseDetail exercisePublicId={exercisePublicId} />
		),
	};
	if (modal.stack.length === 0) return null;

	return (
		<>
			{modal.stack.map((instance) => {
				const Component = ModalRegistry[instance.type];

				if (!Component) {
					console.warn(`No component found for modal type: ${instance.type}`);
					return null;
				}

				return (
					<Modal
						key={instance.id}
						closeOnClickOutside={instance.closeOnClickOutside}
					>
						<Component {...(instance.data || {})} />
					</Modal>
				);
			})}
		</>
	);
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Loader() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-6 w-1/2" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-64 w-full rounded-xl" />
			<div className="space-y-2">
				{Array.from({ length: 4 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<Skeleton key={i} className="h-4 w-full" />
				))}
			</div>
		</div>
	);
}

export function ExerciseDetail({
	exercisePublicId,
}: {
	exercisePublicId: string;
}) {
	const { data, isPending } = useQuery(
		orpc.exercise.byPublicId.queryOptions({
			input: { publicId: exercisePublicId },
		}),
	);

	if (isPending || !data) return <Loader />;

	return (
		<div className="space-y-6">
			<h2 className="font-semibold text-2xl">{data.name}</h2>

			<Tabs defaultValue="about" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="about">About</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>

				<TabsContent value="about" className="mt-6 space-y-6">
					<Card className="flex h-72 items-center justify-center rounded-xl bg-muted">
						<span className="text-muted-foreground text-sm">
							Exercise animation coming soon
						</span>
					</Card>

					<div className="space-y-4">
						<div className="space-y-2">
							<h4 className="font-medium text-muted-foreground text-sm">
								Primary muscle
							</h4>
							<div className="flex flex-wrap gap-2">
								{data.targetMuscles.slice(0, 1).map((muscle) => (
									<Badge key={muscle}>{muscle}</Badge>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<h4 className="font-medium text-muted-foreground text-sm">
								Secondary muscles
							</h4>
							<div className="flex flex-wrap gap-2">
								{data.targetMuscles.slice(1).map((muscle) => (
									<Badge key={muscle} variant="secondary">
										{muscle}
									</Badge>
								))}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<h4 className="font-medium text-muted-foreground text-sm">
							Instructions
						</h4>
						<div className="flex flex-col gap-1">
							{(data.instructions ?? []).map((step: string, index: number) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<span key={index} className="leading-relaxed">
									{step}
								</span>
							))}
						</div>
					</div>
				</TabsContent>

				<TabsContent value="history" className="mt-6">
					<Card className="p-6 text-muted-foreground text-sm">
						Exercise history and progression data will appear here.
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
