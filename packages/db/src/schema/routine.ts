import { sql } from "drizzle-orm";
import {
	bigint,
	decimal,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../utils/timestamps";
import { user } from "./auth";
import { exercises } from "./exercise";

export const setTypeEnum = pgEnum("set_type", [
	"warmup",
	"working",
	"drop",
	"failure",
	"amrap",
]);

export const routines = pgTable(
	"routines",
	{
		id: bigint("id", { mode: "bigint" })
			.generatedAlwaysAsIdentity()
			.primaryKey(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		name: text("name").notNull(),
		notes: text("notes"),
		order: varchar("order").notNull(),
		createdBy: uuid("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(t) => [
		index("routine_public_id_idx").on(t.publicId),
		index("routine_created_by_idx").on(t.createdBy),
		index("routine_order_idx").on(t.createdBy, t.order),
	],
);

export const routineExercises = pgTable(
	"routine_exercises",
	{
		id: bigint("id", { mode: "bigint" })
			.generatedAlwaysAsIdentity()
			.primaryKey(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		routineId: bigint("routine_id", { mode: "bigint" })
			.notNull()
			.references(() => routines.id, { onDelete: "cascade" }),
		exerciseId: integer("exercise_id")
			.notNull()
			.references(() => exercises.id),
		order: varchar("order").notNull(),
		restSeconds: integer("rest_seconds"),
		notes: text("notes"),
		...timestamps,
	},
	(t) => [
		index("re_routine_idx").on(t.routineId),
		index("re_exercise_idx").on(t.exerciseId),
		index("re_order_idx").on(t.routineId, t.order),
	],
);

export const routineSets = pgTable(
	"routine_sets",
	{
		id: bigint("id", { mode: "bigint" })
			.generatedAlwaysAsIdentity()
			.primaryKey(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		routineExerciseId: bigint("routine_exercise_id", { mode: "bigint" })
			.notNull()
			.references(() => routineExercises.id, { onDelete: "cascade" }),
		setType: setTypeEnum("set_type").notNull().default("working"),
		order: varchar("order").notNull(),
		targetWeight: decimal("target_weight", { precision: 10, scale: 2 }),
		targetReps: integer("target_reps"),
		targetRpe: decimal("target_rpe", { precision: 3, scale: 1 }),
		notes: text("notes"),
		...timestamps,
	},
	(t) => [
		index("rs_routine_exercise_idx").on(t.routineExerciseId),
		index("rs_order_idx").on(t.routineExerciseId, t.order),
	],
);
