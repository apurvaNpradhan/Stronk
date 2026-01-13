import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
	bodyPartsData,
	equipmentsData,
	muscleGroupsData,
} from "../data/exercises";
import { exercises } from "../schema/exercise";
import { routineExercises, routineSets, routines } from "../schema/routine";
export const SelectExercise = createSelectSchema(exercises, {}).omit({
	id: true,
	createdBy: true,
});

export const InsertExercise = createInsertSchema(exercises, {
	name: z.string().min(1, "Name is required"),
	gifUrl: z.url("Invalid gif url"),
	thumbnailUrl: z.url("Invalid thumbnail url"),
	targetMuscles: z.array(z.enum(muscleGroupsData)),
	bodyParts: z.array(z.enum(bodyPartsData)),
	equipments: z.array(z.enum(equipmentsData)),
	secondaryMuscles: z.array(z.enum(muscleGroupsData)),
	instructions: z.array(z.string()).min(1, "Instructions is required"),
}).omit({
	publicId: true,
	updatedAt: true,
	createdAt: true,
	deletedAt: true,
});

export const UpdateExercise = createUpdateSchema(exercises).omit({
	createdAt: true,
	deletedAt: true,
});

export const SelectRoutine = createSelectSchema(routines).omit({
	id: true,
});

export const InsertRoutine = createInsertSchema(routines, {
	name: z.string().min(1, "Name is required"),
	notes: z.string().optional(),
}).omit({
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	publicId: true,
});

export const UpdateRoutine = createUpdateSchema(routines).omit({
	createdAt: true,
	deletedAt: true,
	publicId: true,
});

// Routine Exercises
export const SelectRoutineExercise = createSelectSchema(routineExercises).omit({
	id: true,
});

export const InsertRoutineExercise = createInsertSchema(routineExercises, {
	restSeconds: z
		.number()
		.int()
		.min(0, "Rest seconds must be positive")
		.optional(),
	notes: z.string().optional(),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	publicId: true,
	routineId: true,
});

export const UpdateRoutineExercise = createUpdateSchema(routineExercises).omit({
	createdAt: true,
	deletedAt: true,
	publicId: true,
	routineId: true,
	exerciseId: true,
});

// Routine Sets
export const SelectRoutineSet = createSelectSchema(routineSets).omit({
	id: true,
});

export const InsertRoutineSet = createInsertSchema(routineSets, {
	setType: z.enum(["warmup", "working", "drop", "failure", "amrap"]),
	targetWeight: z.number().positive("Weight must be positive").optional(),
	targetReps: z.number().int().positive("Reps must be positive").optional(),
	targetRpe: z
		.number()
		.min(1)
		.max(10, "RPE must be between 1 and 10")
		.optional(),
	notes: z.string().optional(),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	publicId: true,
	routineExerciseId: true,
});

export const UpdateRoutineSet = createUpdateSchema(routineSets).omit({
	createdAt: true,
	deletedAt: true,
	publicId: true,
	routineExerciseId: true,
});

export type InsertRoutineExercise = z.infer<typeof InsertRoutineExercise>;
export type UpdateRoutineExercise = z.infer<typeof UpdateRoutineExercise>;
export type SelectRoutineExercise = z.infer<typeof SelectRoutineExercise>;

export type InsertRoutineSet = z.infer<typeof InsertRoutineSet>;
export type UpdateRoutineSet = z.infer<typeof UpdateRoutineSet>;
export type SelectRoutineSet = z.infer<typeof SelectRoutineSet>;

export type InsertRoutine = z.infer<typeof InsertRoutine>;
export type UpdateRoutine = z.infer<typeof UpdateRoutine>;
export type SelectRoutine = z.infer<typeof SelectRoutine>;

export type SelectExercise = z.infer<typeof SelectExercise>;
export type InsertExercise = z.infer<typeof InsertExercise>;
export type UpdateExercise = z.infer<typeof UpdateExercise>;
