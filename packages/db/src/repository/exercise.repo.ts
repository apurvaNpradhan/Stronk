import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { exercises } from "../schema";

export const list = async (args: {
	limit: number;
	cursor?: string;
	search?: string;
	muscleGroup?: string;
}) => {
	const { limit, cursor, search, muscleGroup } = args;

	let cursorItem: { publicId: string; name: string } | undefined;
	if (cursor) {
		const exercise = await db.query.exercises.findFirst({
			columns: {
				id: true,
				publicId: true,
				name: true,
			},
			where: eq(exercises.publicId, cursor),
		});
		if (exercise) {
			cursorItem = exercise;
		}
	}

	const items = await db.query.exercises.findMany({
		columns: {
			publicId: true,
			name: true,
			gifUrl: true,
			thumbnailUrl: true,
			targetMuscles: true,
			bodyParts: true,
			equipments: true,
			secondaryMuscles: true,
			instructions: true,
			isSystem: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		where: (t, { and, or, gt, eq, ilike }) => {
			const conditions = [];

			if (search) {
				conditions.push(ilike(t.name, `%${search}%`));
			}

			if (muscleGroup) {
				conditions.push(
					or(
						sql`${t.targetMuscles} @> ${JSON.stringify([muscleGroup])}`,
						sql`${t.secondaryMuscles} @> ${JSON.stringify([muscleGroup])}`,
					),
				);
			}

			if (cursorItem) {
				conditions.push(
					or(
						gt(t.name, cursorItem.name),
						and(
							eq(t.name, cursorItem.name),
							gt(t.publicId, cursorItem.publicId),
						),
					),
				);
			}

			return and(...conditions);
		},
		limit: limit + 1,
		orderBy: (t, { asc }) => [asc(t.name), asc(t.publicId)],
	});

	let nextCursor: string | undefined;
	if (items.length > limit) {
		items.pop();
		nextCursor = items[items.length - 1]?.publicId;
	}

	return {
		items,
		nextCursor,
	};
};

export const byId = async (args: { exercisePublicId: string }) => {
	const { exercisePublicId } = args;
	return db.query.exercises.findFirst({
		columns: {
			publicId: true,
			name: true,
			gifUrl: true,
			targetMuscles: true,
			bodyParts: true,
			equipments: true,
			secondaryMuscles: true,
			instructions: true,
			isSystem: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
			createdBy: true,
		},
		where: eq(exercises.publicId, exercisePublicId),
	});
};
