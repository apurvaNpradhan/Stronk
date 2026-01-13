import { ORPCError } from "@orpc/server";
import * as routineRepo from "@stronk/db/repository/routine.repo";
import z from "zod";
import { protectedProcedure } from "..";
import { CreateRoutineInputSchema } from "../types/routine";

export const RoutineRouter = {
	create: protectedProcedure
		.input(CreateRoutineInputSchema)
		.handler(async ({ context, input }) => {
			const { session } = context;
			const lastRoutineOrder = await routineRepo.getLastRoutineOrderByUserId({
				userId: session.user.id,
			});
			await routineRepo.createRoutine({
				userId: session.user.id,
				input: {
					...input,
					order: lastRoutineOrder?.order ?? "a0",
				},
			});
			return {
				success: true,
			};
		}),
	all: protectedProcedure.handler(async ({ context }) => {
		const { session } = context;
		return await routineRepo.getRoutinesByUserId({
			userId: session.user.id,
		});
	}),
	getByPublicId: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { session } = context;
			return await routineRepo.getRoutinebyPublicId({
				publicId: input.publicId,
				userId: session.user.id,
			});
		}),
	getAll: protectedProcedure.handler(async ({ context }) => {
		const { session } = context;
		return await routineRepo.getAllByUserId({
			userId: session.user.id,
		});
	}),
	softDelete: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { session } = context;
			const routine = await routineRepo.getRoutinebyPublicId({
				publicId: input.publicId,
				userId: session.user.id,
			});
			if (!routine) {
				throw new ORPCError("NOT_FOUND", {
					message: "Routine not found",
				});
			}
			return await routineRepo.softDeleteRoutineById({
				id: routine.id,
			});
		}),
};
