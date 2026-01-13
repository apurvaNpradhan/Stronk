import type { SelectExercise } from "@stronk/db/lib/zod-schemas";
import type z from "zod";

export type Exercise = z.infer<typeof SelectExercise>;
