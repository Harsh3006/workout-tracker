import { getExercises } from "./queries.js";
import type { ExerciseCategory } from "./schema.js";
import { exerciseCategoryEnum } from "./schema.js";

export function isExerciseCategory(value: unknown): value is ExerciseCategory {
  return (
    typeof value === "string" &&
    exerciseCategoryEnum.enumValues.includes(value as ExerciseCategory)
  );
}

export async function getInvalidExerciseIds(
  exerciseIds: number[]
): Promise<number[]> {
  const existingExercises = await getExercises({ exerciseIds });
  const existingExerciseIds = new Set(existingExercises.map((e) => e.id));
  return exerciseIds.filter((id) => !existingExerciseIds.has(id));
}
