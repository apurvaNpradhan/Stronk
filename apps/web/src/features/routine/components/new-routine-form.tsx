import { zodResolver } from "@hookform/resolvers/zod";
import type { Exercise } from "@stronk/api/types";
import { CreateRoutineInputSchema } from "@stronk/api/types/routine";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Controller,
	FormProvider,
	useFieldArray,
	useForm,
} from "react-hook-form";
import type { z } from "zod";
import { AutosizeTextarea } from "@/components/autosize-textarea";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	ResponsiveModal,
	ResponsiveModalContent,
	ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { ExerciseSelector } from "@/features/exercises/components/exericise-selector";
import { orpc } from "@/utils/orpc";
import { ExerciseCard } from "./exercise-card";

const generateOrder = (index: number) => `a${index}`;

const formSchema = CreateRoutineInputSchema;

type FormValues = z.infer<typeof formSchema>;
export default function NewRoutineForm() {
	const navigate = useNavigate();
	const createRoutine = useMutation(
		orpc.routine.create.mutationOptions({
			onSuccess: () => {
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
		selectedExercises.forEach((exercise) => {
			append({
				exercisePublicId: exercise.publicId,
				order: generateOrder(currentCount),
				notes: "",
				name: exercise.name,
				thumbnailUrl: exercise.thumbnailUrl,
				restSeconds: 120,
				sets: [
					{
						setType: "working",
						order: "a0",
						targetReps: 1,
						targetWeight: 1,
						targetRpe: 1,
						notes: "",
					},
				],
			});
		});
		setIsExerciseSelectorOpen(false);
	};
	const onSubmit = (values: FormValues) => {
		createRoutine.mutate({
			name: values.name,
			notes: values.notes,
			exercises: values.exercises?.map((exercise) => ({
				exercisePublicId: exercise.exercisePublicId,
				order: exercise.order,
				restSeconds: exercise.restSeconds,
				notes: exercise.notes,
				sets: exercise.sets?.map((set) => ({
					setType: set.setType,
					order: set.order,
					targetReps: set.targetReps,
					targetWeight: set.targetWeight,
					targetRpe: set.targetRpe,
					notes: set.notes,
				})),
			})),
		});
	};
	return (
		<div className="mt-10 flex flex-col">
			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col space-y-6"
				>
					<div className="space-y-1">
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<div className="space-y-1">
									<Input
										{...field}
										placeholder="Routine title..."
										className="h-auto border-none p-0 font-bold font-heading text-3xl shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0 md:text-4xl dark:bg-transparent"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
									/>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
							)}
						/>
						<Controller
							control={form.control}
							name="notes"
							render={({ field }) => (
								<AutosizeTextarea
									placeholder="Notes..."
									{...field}
									value={field.value ?? ""}
									className="resize-none border-none bg-transparent px-0 text-lg text-muted-foreground focus-visible:ring-0"
								/>
							)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<h4 className="font-semibold text-md">{fields.length} Exercises</h4>
						<ResponsiveModal
							open={isExerciseSelectorOpen}
							onOpenChange={setIsExerciseSelectorOpen}
						>
							<div className="flex items-center gap-2">
								<ResponsiveModalTrigger>
									<Button variant={"outline"} size="sm">
										Add Exercise
									</Button>
								</ResponsiveModalTrigger>
								<Button
									type="submit"
									disabled={createRoutine.isPending}
									size={"sm"}
								>
									{createRoutine.isPending ? "Saving..." : "Save routine"}
								</Button>
							</div>
							<ResponsiveModalContent
								className="p-0 sm:max-w-xl"
								showCloseButton={false}
							>
								<ExerciseSelector
									className="h-full"
									onExercisesConfirm={handleAddExercises}
									closeOnSelect={true}
								/>
							</ResponsiveModalContent>
						</ResponsiveModal>
					</div>

					<div className="space-y-4">
						<Accordion className="space-y-2">
							{fields.map((field, index) => (
								<ExerciseCard
									key={field.id}
									id={field.id}
									exerciseIndex={index}
									onRemove={() => remove(index)}
								/>
							))}
						</Accordion>
					</div>

					<div className="sticky bottom-4 flex justify-end" />
				</form>
			</FormProvider>
		</div>
	);
}
