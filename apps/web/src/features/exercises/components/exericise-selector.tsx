import type { Exercise } from "@stronk/api/types";
import {
	IconBarbell,
	IconCheck,
	IconLoader2,
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
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
	} = useInfiniteQuery({
		...orpc.exercise.listExercises.infiniteOptions({
			queryKey: ["exercises", debouncedSearch],
			input: (cursor) => ({
				limit: 20,
				cursor: cursor as string | undefined,
				search: debouncedSearch,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: undefined,
		}),
	});

	const { ref, inView } = useInView({ threshold: 0 });

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
		<Command
			shouldFilter={false}
			className={cn("flex h-full flex-col", className)}
		>
			<CommandInput
				placeholder="Search exercises..."
				value={search}
				onValueChange={handleSearchChange}
			/>
			<CommandList className="max-h-[450px] flex-1">
				{isPending ? (
					<div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
						<IconLoader2 className="h-6 w-6 animate-spin" />
						<p className="text-sm">Loading exercises...</p>
					</div>
				) : isEmpty ? (
					<CommandEmpty className="flex h-full flex-col items-center justify-center p-4">
						<div className="flex flex-col items-center justify-center text-muted-foreground">
							<p className="font-medium">No exercises found</p>
							{search && (
								<p className="mt-1 text-sm">Try a different search term</p>
							)}
						</div>
					</CommandEmpty>
				) : (
					<CommandGroup>
						{exercises.map((exercise) => {
							const selected = isSelected(exercise);
							return (
								<CommandItem
									key={exercise.publicId}
									value={exercise.publicId}
									onSelect={() => handleToggle(exercise)}
									className="flex items-center gap-3 px-2 py-3"
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
								</CommandItem>
							);
						})}

						<div ref={ref} className="flex h-16 items-center justify-center">
							{isFetchingNextPage && (
								<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							)}
						</div>
					</CommandGroup>
				)}
			</CommandList>

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
		</Command>
	);
}
