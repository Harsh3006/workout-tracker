import { ExerciseCategory } from "../models/exercise.js";

export function isExerciseCategory(value: string): value is ExerciseCategory {
  return Object.values(ExerciseCategory).includes(value as ExerciseCategory);
}
