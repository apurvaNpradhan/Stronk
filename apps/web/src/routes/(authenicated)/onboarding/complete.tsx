import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { useOnboardingStore } from "@/features/onboarding/onboarding.store";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

export const Route = createFileRoute("/(authenicated)/onboarding/complete")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const temp = useOnboardingStore((state) => state.temp) ?? "TEMP";
	const form = useForm();
	
	const onSubmit = async () => {
		if (!temp) return;

		toast.promise(
			(async () => {
				const { error } = await authClient.updateUser({
					onboardingCompleted: new Date(),
				});
				
				if (error) throw error;
						queryClient.refetchQueries(sessionQueryOptions);
				navigate({ to: "/dashboard", replace: true });
			})(),
			{
				loading: "Completing onboarding...",
				success: "Onboarding completed successfully!",
				error: (err) => err.message || "Failed to complete onboarding",
			}
		);
	};

	useEffect(() => {
		if (!useOnboardingStore.persist.hasHydrated()) return;
		// If needed, redirect back to a previous step here
	}, [temp]);

	return (
		<div className="bg-muted/30 flex h-svh w-full items-center justify-center p-4">
			<Card className="bg-card/50 shadow-xl border-none w-full max-w-md backdrop-blur-sm">
				<CardHeader className="pb-2 text-center">
					<div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
						<IconCheck className="size-6" />
					</div>
					<CardTitle className="font-bold text-2xl">You're all set!</CardTitle>
					<CardDescription>
						Click the button below to finish your onboarding and start using the dashboard.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<Button
							type="submit"
							className="hover:scale-[1.02] active:scale-[0.98] h-11 w-full text-base font-semibold transition-all"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<>
									<IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
									Finishing...
								</>
							) : (
								"Explore Dashboard"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

