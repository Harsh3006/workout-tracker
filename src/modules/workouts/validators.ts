import { getExercises } from "../exercises/queries.js";
import type { WorkoutExercise } from "./models.js";

export function validateWorkoutExercisesData(
  exercises: unknown
): string | null {
  if (!Array.isArray(exercises)) return "Exercises must be an array";
  if (exercises.length === 0) return "At least one exercise is required";

  for (const exercise of exercises as WorkoutExercise[]) {
    if (
      !exercise.exerciseId ||
      !exercise.sets ||
      !Array.isArray(exercise.sets) ||
      exercise.sets.length === 0
    )
      return "Each exercise must have an exerciseId and at least one set";
    for (const set of exercise.sets) {
      if (typeof set.reps !== "number" || typeof set.weight !== "number")
        return "Each set must have numeric reps and weight";
      if (set.reps <= 0 || set.weight < 0)
        return "Each set must have positive reps and non-negative weight";
    }
  }
  return null;
}

export async function getMissingExerciseIds(
  exercises: WorkoutExercise[]
): Promise<number[]> {
  const exerciseIds = exercises.map((e) => Number(e.exerciseId));
  const existingExercises = await getExercises({ exerciseIds });
  const existingExerciseIds = new Set(existingExercises.map((e) => e.id));
  return exerciseIds.filter((id) => !existingExerciseIds.has(id));
}
