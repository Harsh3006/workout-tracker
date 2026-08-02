import { db } from "@/db.js";
import type { User } from "@/modules/users/schema.js";
import type { NewWorkout } from "@/modules/workouts/schema.js";
import {
  exerciseSets,
  workoutExercises,
  workouts,
} from "@/modules/workouts/schema.js";

export async function seedWorkout(
  user: User,
  overrides: Partial<Omit<NewWorkout, "userId">> = {}
) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: user.id,
      name: "Push Day",
      performedAt: new Date(),
      ...overrides,
    })
    .returning();
  return workout!;
}

export async function seedWorkoutExercisesWithSets(
  workoutId: string,
  exercises: { exerciseId: number; sets: { reps: number; weight: number }[] }[]
) {
  const exercisesToInsert = exercises.map((exercise, index) => ({
    workoutId,
    exerciseId: exercise.exerciseId,
    orderIndex: index,
  }));
  const insertedExercises = await db
    .insert(workoutExercises)
    .values(exercisesToInsert)
    .returning();
  const workoutExerciseIds = insertedExercises.map((exercise) => exercise.id);
  const setsToInsert = exercises.flatMap((exercise, exerciseIndex) => {
    const workoutExerciseId = workoutExerciseIds[exerciseIndex]!;
    return exercise.sets.map((set, setIndex) => ({
      workoutExerciseId,
      reps: set.reps,
      weight: set.weight,
      orderIndex: setIndex,
    }));
  });
  await db.insert(exerciseSets).values(setsToInsert).returning();
}
