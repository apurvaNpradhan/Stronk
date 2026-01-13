import {
	InsertRoutine,
	InsertRoutineExercise,
	InsertRoutineSet,
} from "@stronk/db/lib/zod-schemas";
import z from "zod";

export const CreateRoutineInputSchema = InsertRoutine.omit({
	order: true,
}).extend({
	exercises: z
		.array(
			InsertRoutineExercise.omit({ exerciseId: true }).extend({
				exercisePublicId: z.uuid(),
				sets: z.array(InsertRoutineSet).optional(),
			}),
		)
		.optional(),
});
export type CreateRoutineInput = z.infer<typeof CreateRoutineInputSchema>;
