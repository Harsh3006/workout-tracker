import { ValidationError } from "@/shared/errors.js";

import { getInvalidExerciseIds } from "../exercises/validators.js";
import type {
  CreateWorkoutData,
  UpdateWorkoutData,
  WorkoutExerciseData,
} from "./types.js";

export function validateWorkoutExercisesData(
  exercises: unknown
): asserts exercises is WorkoutExerciseData[] {
  if (!Array.isArray(exercises))
    throw new ValidationError("exercises are required and must be an array.");
  if (exercises.length === 0)
    throw new ValidationError("At least one exercise is required.");

  for (const exercise of exercises) {
    if (
      typeof exercise !== "object" ||
      exercise === null ||
      typeof exercise.exerciseId !== "number"
    )
      throw new ValidationError(
        "Each exercise must have a numeric exerciseId."
      );

    if (!Array.isArray(exercise.sets) || exercise.sets.length === 0)
      throw new ValidationError("Each exercise must have at least one set.");

    for (const set of exercise.sets) {
      if (typeof set.reps !== "number" || typeof set.weight !== "number")
        throw new ValidationError(
          "Each set must have numeric reps and weight."
        );
      if (set.reps <= 0)
        throw new ValidationError("Reps must be greater than 0.");
      if (set.weight < 0)
        throw new ValidationError("Weight cannot be negative.");
    }
  }
}

export async function validateCreateWorkoutData(
  data: unknown
): Promise<CreateWorkoutData> {
  if (!data || typeof data !== "object")
    throw new ValidationError("Workout data is required.");

  const workout = data as CreateWorkoutData;
  if (typeof workout.name !== "string" || workout.name.trim() === "")
    throw new ValidationError("Workout name is required.");

  const performedAt = new Date(workout?.performedAt);
  if (Number.isNaN(performedAt.getTime()))
    throw new ValidationError(
      "performedAt is required and must be a valid datetime."
    );

  validateWorkoutExercisesData(workout.exercises);
  const exerciseIds = workout.exercises.map((exercise) => exercise.exerciseId);
  const invalidExerciseIds = await getInvalidExerciseIds(exerciseIds);
  if (invalidExerciseIds.length > 0)
    throw new ValidationError("One or more exercises do not exist.", {
      invalidExerciseIds: invalidExerciseIds,
    });

  return {
    name: workout.name.trim(),
    performedAt: performedAt,
    notes: workout.notes?.trim() || undefined,
    exercises: workout.exercises!,
  };
}

export async function validateUpdateWorkoutData(
  data: unknown
): Promise<UpdateWorkoutData> {
  if (!data || typeof data !== "object")
    throw new ValidationError("Workout data is required.");

  const workout = data as UpdateWorkoutData;
  const validatedData: UpdateWorkoutData = {};

  if (Object.keys(workout).length === 0)
    throw new ValidationError(
      "At least one field must be provided for update."
    );

  if (workout.name !== undefined) {
    if (typeof workout.name !== "string" || workout.name.trim() === "")
      throw new ValidationError("Workout name must be a non-empty string.");
    validatedData.name = workout.name.trim();
  }

  if (workout.performedAt !== undefined) {
    const performedAt = new Date(workout.performedAt);
    if (Number.isNaN(performedAt.getTime()))
      throw new ValidationError("performedAt must be a valid datetime.");
    validatedData.performedAt = performedAt;
  }

  if (workout.notes !== undefined) {
    if (workout.notes !== null && typeof workout.notes !== "string")
      throw new ValidationError("Notes must be a string.");
    validatedData.notes = workout.notes?.trim();
  }

  if (workout.exercises !== undefined) {
    validateWorkoutExercisesData(workout.exercises);
    const exerciseIds = workout.exercises.map((e) => e.exerciseId);
    const invalidExerciseIds = await getInvalidExerciseIds(exerciseIds);
    if (invalidExerciseIds.length > 0)
      throw new ValidationError("One or more exercises do not exist.", {
        invalidExerciseIds: invalidExerciseIds,
      });
    validatedData.exercises = workout.exercises;
  }
  return validatedData;
}
