import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/index.js";

import type { Exercise, ExerciseCategory } from "./schema.js";
import { exercises } from "./schema.js";

export async function getExerciseById(
  id: number
): Promise<Exercise | undefined> {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, id));
  return exercise;
}

export async function getExercises(
  params: {
    exerciseIds?: number[];
    category?: ExerciseCategory;
  } = {}
): Promise<Exercise[]> {
  const { exerciseIds, category } = params;
  return db
    .select()
    .from(exercises)
    .where(
      and(
        exerciseIds ? inArray(exercises.id, exerciseIds) : undefined,
        category ? eq(exercises.category, category) : undefined
      )
    );
}
