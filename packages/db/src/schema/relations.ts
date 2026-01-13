import { relations } from "drizzle-orm";
import { user } from "./auth";
import { exercises } from "./exercise";
import { routineExercises, routineSets, routines } from "./routine";

export const routineRelations = relations(routines, ({ one, many }) => {
	return {
		routineExercises: many(routineExercises),
		createdBy: one(user, {
			fields: [routines.createdBy],
			references: [user.id],
		}),
	};
});

export const exerciseRelations = relations(exercises, ({ many }) => {
	return {
		routineExercises: many(routineExercises),
	};
});

export const routineExerciseRelations = relations(
	routineExercises,
	({ one, many }) => {
		return {
			routine: one(routines, {
				fields: [routineExercises.routineId],
				references: [routines.id],
			}),
			exercise: one(exercises, {
				fields: [routineExercises.exerciseId],
				references: [exercises.id],
			}),
			sets: many(routineSets),
		};
	},
);

export const routineSetRelations = relations(routineSets, ({ one }) => {
	return {
		routineExercise: one(routineExercises, {
			fields: [routineSets.routineExerciseId],
			references: [routineExercises.id],
		}),
	};
});
