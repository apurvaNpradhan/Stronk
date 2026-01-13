import type { Exercise } from "@stronk/api/types";
import {
	IconBarbell,
	IconCheck,
	IconLoader2,
	IconSearch,
	IconTarget,
} from "@tabler/icons-react";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

interface ExerciseSelectorProps {
	selectedExerciseId?: string;
	onExerciseChange?: (exerciseId: string) => void;
	onExerciseSelect?: (exercise: Exercise) => void;

	selectedExerciseIds?: string[];
	onExercisesChange?: (exerciseIds: string[]) => void;
	onExercisesConfirm?: (exercises: Exercise[]) => void;

	onOpenChange?: (open: boolean) => void;

	closeOnSelect?: boolean;
	className?: string;
}

function ExerciseItemSkeleton() {
	return (
		<div className="flex items-center gap-3 p-3">
			<Skeleton className="h-12 w-12 rounded-lg" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-24" />
			</div>
			<Skeleton className="h-5 w-5 rounded" />
		</div>
	);
}

export function ExerciseSelector({
	selectedExerciseId,
	selectedExerciseIds = [],
	onExerciseChange,
	onExerciseSelect,
	onExercisesChange,
	onExercisesConfirm,
	onOpenChange,
	closeOnSelect = true,
	className,
}: ExerciseSelectorProps) {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [stagedExercises, setStagedExercises] = useState<Exercise[]>([]);

	const debouncedSetSearch = useDebouncedCallback(
		(value: string) => setDebouncedSearch(value),
		{ wait: 300 },
	);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		debouncedSetSearch(value);
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		isPending,
	} = useInfiniteQuery(
		orpc.exercise.listExercises.infiniteOptions({
			input: (cursor) => ({
				limit: 20,
				cursor: cursor as string | undefined,
				search: debouncedSearch,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: undefined as string | undefined,
		}),
	);

	const { ref, inView } = useInView({ threshold: 0.1 });

	if (inView && hasNextPage && !isFetchingNextPage) {
		fetchNextPage();
	}

	const exercises = useMemo(
		() => data?.pages.flatMap((p) => p.items) ?? [],
		[data?.pages],
	);

	const isSelected = (exercise: Exercise) => {
		if (onExercisesConfirm) {
			return stagedExercises.some((e) => e.publicId === exercise.publicId);
		}
		if (selectedExerciseIds.length > 0) {
			return selectedExerciseIds.includes(exercise.publicId);
		}
		return selectedExerciseId === exercise.publicId;
	};

	const handleToggle = (exercise: Exercise) => {
		if (onExercisesConfirm) {
			const isStaged = stagedExercises.some(
				(e) => e.publicId === exercise.publicId,
			);
			if (isStaged) {
				setStagedExercises(
					stagedExercises.filter((e) => e.publicId !== exercise.publicId),
				);
			} else {
				setStagedExercises([...stagedExercises, exercise]);
			}
			return;
		}

		if (onExercisesChange) {
			const isCurrentlySelected = selectedExerciseIds.includes(
				exercise.publicId,
			);
			if (isCurrentlySelected) {
				onExercisesChange(
					selectedExerciseIds.filter((id) => id !== exercise.publicId),
				);
			} else {
				onExercisesChange([...selectedExerciseIds, exercise.publicId]);
			}
		} else {
			onExerciseChange?.(exercise.publicId);
			onExerciseSelect?.(exercise);
			if (closeOnSelect) {
				onOpenChange?.(false);
			}
		}
	};

	const handleConfirm = () => {
		onExercisesConfirm?.(stagedExercises);
		onOpenChange?.(false);
	};

	const isEmpty = status === "success" && exercises.length === 0;
	return (
		<div className={cn("flex h-full flex-col", className)}>
			<div className="border-b p-4">
				<InputGroup>
					<InputGroupInput
						placeholder="Search exercises..."
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
					<InputGroupAddon>
						<IconSearch className="h-4 w-4" />
					</InputGroupAddon>
				</InputGroup>
			</div>
			<div className="flex-1 overflow-y-auto">
				{isPending ? (
					<div className="p-2">
						{[1, 2, 3, 4, 5, 6].map((id) => (
							<ExerciseItemSkeleton key={id} />
						))}
					</div>
				) : isEmpty ? (
					<div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
						<IconSearch className="mb-4 h-12 w-12 opacity-20" />
						<p className="font-medium">No exercises found</p>
						{search && (
							<p className="mt-1 text-sm">Try a different search term</p>
						)}
					</div>
				) : (
					<div className="p-2">
						{exercises.map((exercise) => {
							const selected = isSelected(exercise);
							return (
								<button
									key={exercise.publicId}
									type="button"
									onClick={() => handleToggle(exercise)}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
										selected ? "bg-primary/10" : "hover:bg-muted",
									)}
								>
									<Avatar className="h-12 w-12 rounded-lg">
										<AvatarImage
											src={exercise.thumbnailUrl ?? undefined}
											className="object-cover"
										/>
										<AvatarFallback className="rounded-lg bg-muted">
											<IconBarbell className="h-6 w-6 text-muted-foreground" />
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<h4 className="truncate font-medium text-sm">
											{exercise.name}
										</h4>

										<div className="mt-1 flex gap-1.5">
											{exercise.targetMuscles.slice(0, 1).map((tm) => (
												<Badge
													key={tm}
													variant="secondary"
													className="h-5 px-1.5 text-xs"
												>
													<IconTarget className="mr-1 h-3 w-3" />
													{tm}
												</Badge>
											))}
											{exercise.bodyParts.slice(0, 1).map((bp) => (
												<Badge
													key={bp}
													variant="outline"
													className="h-5 px-1.5 text-xs"
												>
													{bp}
												</Badge>
											))}
										</div>
									</div>

									<div
										className={cn(
											"flex h-5 w-5 items-center justify-center rounded border-2",
											selected ? "border-primary bg-primary" : "border-input",
										)}
									>
										{selected && (
											<IconCheck className="h-3 w-3 text-primary-foreground" />
										)}
									</div>
								</button>
							);
						})}

						<div ref={ref} className="flex h-16 items-center justify-center">
							{isFetchingNextPage && (
								<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							)}
						</div>
					</div>
				)}
			</div>

			{onExercisesConfirm && stagedExercises.length > 0 && (
				<div className="flex items-center justify-between border-t p-4">
					<span className="text-muted-foreground text-sm">
						{stagedExercises.length} selected
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setStagedExercises([])}
						>
							Clear
						</Button>
						<Button size="sm" onClick={handleConfirm}>
							Add Exercises
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
