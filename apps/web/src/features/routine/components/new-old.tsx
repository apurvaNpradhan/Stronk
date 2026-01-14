import { zodResolver } from "@hookform/resolvers/zod";
import type { Exercise } from "@stronk/api/types";
import { CreateRoutineInputSchema } from "@stronk/api/types/routine";
import {
	IconDotsVertical,
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	type Control,
	type FieldArrayWithId,
	type UseFieldArrayUpdate,
	useFieldArray,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AutosizeTextarea } from "@/components/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ResponsiveModal,
	ResponsiveModalContent,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
	ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { ExerciseSelector } from "@/features/exercises/components/exericise-selector";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const generateOrder = (index: number) => `a${index}`;

type SetType = "warmup" | "working" | "failure" | "drop" | "amrap";

const setTypeConfig: Record<
	SetType,
	{ label: string; color: string; bg: string }
> = {
	warmup: { label: "W", color: "text-yellow-600", bg: "bg-yellow-100" },
	working: { label: "1", color: "text-zinc-100", bg: "bg-zinc-900" },
	failure: { label: "F", color: "text-red-600", bg: "bg-red-100" },
	drop: { label: "D", color: "text-blue-600", bg: "bg-blue-100" },
	amrap: { label: "A", color: "text-green-600", bg: "bg-green-100" },
};

const formSchema = CreateRoutineInputSchema.extend({
	exercises: z.array(
		z.object({
			exercisePublicId: z.string(),
			name: z.string(),
			restSeconds: z.number().optional(),
			notes: z.string().optional(),
			order: z.string(),
			sets: z.array(
				z.object({
					setType: z.enum(["warmup", "working", "failure", "drop", "amrap"]),
					targetWeight: z.number().optional(),
					targetReps: z.number().optional(),
					targetRpe: z.number().optional(),
					order: z.string(),
					notes: z.string().optional(),
				}),
			),
		}),
	),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRoutineForm() {
	const navigate = useNavigate();
	const createRoutine = useMutation(
		orpc.routine.create.mutationOptions({
			onSuccess: () => {
				toast.success("Routine created successfully");
				navigate({ to: "/dashboard" });
			},
		}),
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			notes: "",
			exercises: [],
		},
	});

	const { fields, append, remove, update } = useFieldArray({
		control: form.control,
		name: "exercises",
	});

	const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);

	const handleAddExercises = (selectedExercises: Exercise[]) => {
		const currentCount = fields.length;
		selectedExercises.forEach((exercise, index) => {
			append({
				exercisePublicId: exercise.publicId,
				name: exercise.name,
				order: generateOrder(currentCount + index),
				sets: [
					{
						setType: "working",
						order: "a0",
						targetWeight: 0, // defaults
						targetReps: 0,
					},
				],
			});
		});
		setIsExerciseSelectorOpen(false);
	};

	const onSubmit = (values: FormValues) => {
		// Clean up values ensures numbers are numbers
		createRoutine.mutate({
			name: values.name,
			notes: values.notes,
			exercises: values.exercises.map((ex) => ({
				exercisePublicId: ex.exercisePublicId,
				restSeconds: ex.restSeconds,
				notes: ex.notes,
				order: ex.order,
				sets: ex.sets.map((set) => ({
					setType: set.setType,
					targetWeight: set.targetWeight,
					targetReps: set.targetReps,
					targetRpe: set.targetRpe,
					order: set.order,
					notes: set.notes,
				})),
			})),
		});
	};

	return (
		<div className="mx-auto max-w-3xl space-y-8 p-4 py-8 md:p-8">
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{/* Header Section */}
				<div className="space-y-4">
					<input
						{...form.register("name")}
						placeholder="Routine title..."
						className="w-full bg-transparent font-bold text-4xl placeholder:text-muted-foreground/50 focus:outline-none"
					/>
					<AutosizeTextarea
						{...form.register("notes")}
						placeholder="Notes..."
						minHeight={40}
						className="resize-none border-none bg-transparent px-0 text-muted-foreground focus-visible:ring-0"
					/>
				</div>

				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">Exercises</h3>
					<ResponsiveModal
						open={isExerciseSelectorOpen}
						onOpenChange={setIsExerciseSelectorOpen}
					>
						<ResponsiveModalTrigger>
							<Button>
								<IconPlus className="mr-2 h-4 w-4" />
								Add Exercise
							</Button>
						</ResponsiveModalTrigger>
						<ResponsiveModalContent className="h-[80vh] p-0 sm:max-w-xl">
							<ResponsiveModalHeader className="p-4 pb-0">
								<ResponsiveModalTitle>Select Exercises</ResponsiveModalTitle>
							</ResponsiveModalHeader>
							<ExerciseSelector
								className="h-full"
								onExercisesConfirm={handleAddExercises}
								closeOnSelect={false}
							/>
						</ResponsiveModalContent>
					</ResponsiveModal>
				</div>

				{/* Exercises List */}
				<div className="space-y-8">
					{fields.map((field, index) => (
						<ExerciseCard
							key={field.id}
							index={index}
							control={form.control}
							onRemove={() => remove(index)}
							update={update}
							field={field}
						/>
					))}
					{fields.length === 0 && (
						<div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
							<p>No exercises added yet.</p>
							<Button
								variant="link"
								type="button"
								onClick={() => setIsExerciseSelectorOpen(true)}
							>
								Add your first exercise
							</Button>
						</div>
					)}
				</div>

				{/* Footer Action */}
				<div className="sticky bottom-4 flex justify-end">
					<Button type="submit" size="lg" disabled={createRoutine.isPending}>
						{createRoutine.isPending ? "Saving..." : "Create Routine"}
					</Button>
				</div>
			</form>
		</div>
	);
}

function ExerciseCard({
	index,
	control,
	onRemove,
	update,
	field,
}: {
	index: number;
	control: Control<FormValues>;
	onRemove: () => void;
	update: UseFieldArrayUpdate<FormValues, "exercises">;
	field: FieldArrayWithId<FormValues, "exercises", "id">;
}) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `exercises.${index}.sets`,
	});

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-1">
					<h4 className="font-semibold text-lg">{field.name}</h4>
					{/* Exercise Notes if needed */}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="ghost" size="icon">
							<IconDotsVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onRemove} className="text-red-500">
							<IconTrash className="mr-2 h-4 w-4" />
							Remove Exercise
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="mt-4 space-y-2">
				{fields.map((set, setIndex) => (
					<div
						key={set.id}
						className="group flex items-center justify-between gap-4 rounded-md p-2 transition-colors hover:bg-muted/50"
					>
						<div className="flex items-center gap-4">
							<SetTypeBadge
								type={set.setType}
								index={setIndex} // Standard working sets often numbered
							/>
							<div className="flex items-baseline gap-1 text-sm">
								<span className="font-semibold tabular-nums">
									{set.targetWeight || 0}
								</span>
								<span className="text-muted-foreground text-xs">kg</span>
								<span className="mx-1 text-muted-foreground">x</span>
								<span className="font-semibold tabular-nums">
									{set.targetReps || 0}
								</span>
								<span className="text-muted-foreground text-xs">reps</span>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							className="opacity-0 transition-opacity group-hover:opacity-100"
							onClick={() => remove(setIndex)}
						>
							<IconX className="h-4 w-4 text-muted-foreground" />
						</Button>
					</div>
				))}
				<Button
					variant="ghost"
					size="sm"
					className="mt-2 w-full text-muted-foreground hover:text-foreground"
					onClick={() =>
						append({
							setType: "working",
							targetWeight: 0,
							targetReps: 0,
							order: generateOrder(fields.length),
						})
					}
				>
					<IconPlus className="mr-2 h-4 w-4" />
					Add Set
				</Button>
			</div>
		</div>
	);
}

function SetTypeBadge({ type, index }: { type: SetType; index: number }) {
	const config = setTypeConfig[type];
	const isWorking = type === "working";
	// If working set, we might show the index + 1
	const label = isWorking ? (index + 1).toString() : config.label;

	return (
		<div
			className={cn(
				"flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs",
				config.bg,
				config.color,
			)}
		>
			{label}
		</div>
	);
}
