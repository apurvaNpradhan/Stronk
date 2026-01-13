import { and, eq, isNull } from "drizzle-orm";
import { db } from "..";
import type {
	InsertRoutine,
	InsertRoutineExercise,
	InsertRoutineSet,
} from "../lib/zod-schemas";
import { exercises, routineExercises, routineSets, routines } from "../schema";

export const createRoutine = async (args: {
	input: InsertRoutine & {
		exercises?: (Omit<InsertRoutineExercise, "exerciseId"> & {
			exercisePublicId: string;
			sets?: InsertRoutineSet[];
		})[];
	};
	userId: string;
}) => {
	const { input, userId } = args;
	await db.transaction(async (tx) => {
		const [routine] = await tx
			.insert(routines)
			.values({
				createdBy: userId,
				name: input.name,
				order: input.order,
				notes: input.notes,
			})
			.returning({
				id: routines.id,
			});
		if (routine && input.exercises) {
			for (const exercise of input.exercises) {
				const exerciseRecord = await tx.query.exercises.findFirst({
					where: eq(exercises.publicId, exercise.exercisePublicId),
					columns: { id: true },
				});

				if (!exerciseRecord) {
					throw new Error(
						`Exercise with publicId ${exercise.exercisePublicId} not found`,
					);
				}

				const [x] = await tx
					.insert(routineExercises)
					.values({
						routineId: routine.id,
						exerciseId: exerciseRecord.id,
						restSeconds: exercise.restSeconds,
						order: exercise.order,
						notes: exercise.notes,
					})
					.returning({
						id: routineExercises.id,
					});
				if (x && exercise.sets) {
					for (const set of exercise.sets) {
						await tx.insert(routineSets).values({
							routineExerciseId: x.id,
							setType: set.setType,
							targetWeight: set.targetWeight?.toString(),
							targetReps: set.targetReps,
							targetRpe: set.targetRpe?.toString(),
							order: set.order,
							notes: set.notes,
						});
					}
				}
			}
		}
		return routine;
	});
};

export const getRoutineById = async (args: { id: bigint; userId: string }) => {
	const { id, userId } = args;
	return await db.query.routines.findFirst({
		where: and(eq(routines.id, id), eq(routines.createdBy, userId)),
		with: {
			routineExercises: {
				with: {
					sets: true,
				},
			},
		},
	});
};
export const getRoutinebyPublicId = async (args: {
	publicId: string;
	userId: string;
}) => {
	const { publicId, userId } = args;
	return await db.query.routines.findFirst({
		where: and(eq(routines.publicId, publicId), eq(routines.createdBy, userId)),
		with: {
			routineExercises: {
				with: {
					exercise: true,
					sets: true,
				},
			},
		},
	});
};
export const getRoutinesByUserId = async (args: { userId: string }) => {
	const { userId } = args;
	return await db.query.routines.findMany({
		where: eq(routines.createdBy, userId),
		with: {
			routineExercises: {
				with: {
					exercise: true,
					sets: true,
				},
			},
		},
	});
};

export const getRoutineIdByPublicId = async (args: {
	publicId: string;
	userId: string;
}) => {
	const { publicId, userId } = args;
	return await db.query.routines.findFirst({
		where: and(eq(routines.publicId, publicId), eq(routines.createdBy, userId)),
		columns: {
			id: true,
		},
	});
};

export const getLastRoutineOrderByUserId = async (args: { userId: string }) => {
	const { userId } = args;
	return await db.query.routines.findFirst({
		where: eq(routines.createdBy, userId),
		columns: {
			id: true,
			order: true,
		},
	});
};

export const getAllByUserId = async (args: { userId: string }) => {
	const result = await db.query.routines.findMany({
		where: and(isNull(routines.deletedAt), eq(routines.createdBy, args.userId)),
		with: {
			routineExercises: {
				columns: {
					id: true,
				},
				with: {
					sets: {
						columns: {
							id: true,
							targetReps: true,
						},
					},
				},
			},
		},
	});
	return result;
};

export const deleteRoutineById = async (args: { id: bigint }) => {
	const { id } = args;
	await db.delete(routines).where(eq(routines.id, id));
};
export const softDeleteRoutineById = async (args: { id: bigint }) => {
	const { id } = args;
	await db
		.update(routines)
		.set({ deletedAt: new Date() })
		.where(eq(routines.id, id));
};
