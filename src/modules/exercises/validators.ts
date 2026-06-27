import { ValidationError } from "@/shared/errors.js";

import { getExercises } from "./queries.js";
import type { ExerciseCategory } from "./schema.js";
import { exerciseCategoryEnum } from "./schema.js";

export function validateExerciseCategory(
  category: unknown
): asserts category is ExerciseCategory {
  if (typeof category !== "string")
    throw new ValidationError("Category must be a string.");
  if (!exerciseCategoryEnum.enumValues.includes(category as ExerciseCategory))
    throw new ValidationError("Invalid category.", {
      category: `${category} is not a valid exercise category.`,
    });
}

export async function getInvalidExerciseIds(
  exerciseIds: number[]
): Promise<number[]> {
  const existingExercises = await getExercises({ exerciseIds });
  const existingExerciseIds = new Set(existingExercises.map((e) => e.id));
  return exerciseIds.filter((id) => !existingExerciseIds.has(id));
}
