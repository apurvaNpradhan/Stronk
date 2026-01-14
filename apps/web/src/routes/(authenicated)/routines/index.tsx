import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/(authenicated)/routines/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isPending } = useQuery(orpc.routine.getAll.queryOptions());
	const deleteRoutine = useMutation(
		orpc.routine.softDelete.mutationOptions({
			onMutate: ({ publicId }) => {
				const queryKey = orpc.routine.getAll.queryKey();
				const previousData = queryClient.getQueryData(queryKey);
				if (previousData) {
					queryClient.setQueryData(queryKey, (prev) => {
						if (!prev) {
							return prev;
						}
						return prev.filter((routine) => routine.publicId !== publicId);
					});
					return { previousData };
				}
			},
			onError: (_err, _context, _prev) => {
				queryClient.setQueryData(
					orpc.routine.getAll.queryKey(),
					_prev?.previousData,
				);
			},
			onSuccess: () => {
				toast.success("Routine deleted successfully");
				queryClient.invalidateQueries(orpc.routine.getAll.queryOptions());
			},
		}),
	);

	return (
		<MainLayout header={<Header />}>
			<div className="mx-auto max-w-5xl px-4">
				<h1 className="mb-8 font-bold text-2xl">All Routines</h1>
				{isPending ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
						))}
					</div>
				) : data?.length === 0 ? (
					<EmptyView />
				) : (
					data?.map((routine) => {
						/*    const totalSets = routine.routineExercises.reduce(
                (acc, exercise) => acc + (exercise.sets?.length || 0),
                0,
              )

  */

						return (
							<div
								key={routine.publicId}
								className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
							>
								<Link
									to="/routines/$id"
									params={{ id: routine.publicId }}
									className="flex-1"
								>
									<div className="text-lg tracking-tight">{routine.name}</div>
									<div className="text-muted-foreground text-sm">
										{routine.routineExercises.length} exercises
									</div>
								</Link>

								<div className="flex items-center opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
									<DropdownMenu>
										<DropdownMenuTrigger
											className={cn(
												buttonVariants({ variant: "ghost", size: "icon" }),
												"h-8 w-8",
											)}
										>
											<MoreVertical className="h-4 w-4 text-muted-foreground" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() =>
													deleteRoutine.mutate({ publicId: routine.publicId })
												}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						);
					})
				)}
			</div>
		</MainLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full items-center justify-between px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
			</div>

			<Link
				to="/routines/new"
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground",
				)}
			>
				<Plus className="mr-1 h-4 w-4" />
				Add new routine
			</Link>
		</div>
	);
}

function EmptyView() {
	const navigate = useNavigate();
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyTitle>No routines found</EmptyTitle>
				<EmptyDescription>
					You have not created any routines yet.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						navigate({
							to: "/routines/new",
						})
					}
				>
					Create Routine
				</Button>
			</EmptyContent>
		</Empty>
	);
}
