import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExerciseSelector } from "@/features/exercises/components/exericise-selector";
export const Route = createFileRoute("/(authenicated)/exercises/all")({
	component: RouteComponent,
});

function RouteComponent() {
	const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

	return (
		<div>
			<ExerciseSelector
				selectedExerciseIds={selectedExerciseIds}
				onExercisesConfirm={(exercises) =>
					setSelectedExerciseIds(exercises.map((exercise) => exercise.publicId))
				}
			/>
			{selectedExerciseIds.length > 0 && (
				<div>Selected Exercises: {selectedExerciseIds.join(", ")}</div>
			)}
		</div>
	);
}
