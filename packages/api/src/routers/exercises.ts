import * as exerciseRepo from "@stronk/db/repository/exercise.repo";
import z from "zod";
import { protectedProcedure } from "..";

export const ExerciseRouter = {
	listExercises: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				cursor: z.string().optional(),
				search: z.string().optional(),
				muscleGroup: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return exerciseRepo.list({
				limit: input.limit,
				cursor: input.cursor,
				search: input.search,
				muscleGroup: input.muscleGroup,
			});
		}),
	byPublicId: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof exerciseRepo.byId>>>())
		.handler(async ({ input }) => {
			return exerciseRepo.byId({
				exercisePublicId: input.publicId,
			});
		}),
};
