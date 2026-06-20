import type { ExerciseCategory } from "./schema.js";
import { exerciseCategoryEnum } from "./schema.js";

export function isExerciseCategory(value: unknown): value is ExerciseCategory {
  return (
    typeof value === "string" &&
    exerciseCategoryEnum.enumValues.includes(value as ExerciseCategory)
  );
}
