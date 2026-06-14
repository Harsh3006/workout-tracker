import { ExerciseCategory } from "./models.js";

export function isExerciseCategory(value: string): value is ExerciseCategory {
  return Object.values(ExerciseCategory).includes(value as ExerciseCategory);
}
