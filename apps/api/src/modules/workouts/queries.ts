import { and, desc, eq, inArray } from "drizzle-orm";

import type { Transaction } from "@/db.js";
import { db } from "@/db.js";
import { exercises } from "@/modules/exercises/schema.js";
import { NotFoundError } from "@/shared/errors.js";

import type {
  ExerciseSet,
  UpdateWorkout,
  Workout,
  WorkoutDetails,
  WorkoutExercise,
  WorkoutExerciseDetails,
} from "./schema.js";
import { exerciseSets, workoutExercises, workouts } from "./schema.js";
import type {
  CreateWorkoutData,
  UpdateWorkoutData,
  WorkoutExerciseData,
} from "./types.js";

export async function getWorkouts(userId: string): Promise<Workout[]> {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.performedAt));
}

export async function getWorkoutById(
  userId: string,
  workoutId: string
): Promise<Workout | undefined> {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)));
  return workout;
}

export async function createWorkout(
  userId: string,
  data: CreateWorkoutData
): Promise<Workout> {
  return await db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workouts)
      .values({
        userId,
        name: data.name,
        performedAt: data.performedAt,
        notes: data.notes ?? null,
      })
      .returning();
    if (!workout)
      throw new Error("Failed to create workout: database returned no rows.");

    const createdWorkoutExercises = await createWorkoutExercises(
      tx,
      workout.id,
      data.exercises
    );
    await createExerciseSets(
      tx,
      createdWorkoutExercises.map((obj) => obj.id),
      data.exercises
    );
    return workout;
  });
}

export async function createWorkoutExercises(
  tx: Transaction,
  workoutId: string,
  data: WorkoutExerciseData[]
): Promise<WorkoutExercise[]> {
  const exercisesToInsert = data.map((exercise, index) => ({
    workoutId,
    exerciseId: exercise.exerciseId,
    orderIndex: index,
  }));
  return await tx
    .insert(workoutExercises)
    .values(exercisesToInsert)
    .returning();
}

export async function createExerciseSets(
  tx: Transaction,
  workoutExerciseIds: number[],
  data: WorkoutExerciseData[]
): Promise<ExerciseSet[]> {
  const setsToInsert = data.flatMap((exercise, exerciseIndex) => {
    const workoutExerciseId = workoutExerciseIds[exerciseIndex];
    if (workoutExerciseId === undefined)
      throw new Error(
        "Invariant violated: workoutExerciseIds and data must have the same length."
      );

    return exercise.sets.map((set, setIndex) => ({
      workoutExerciseId,
      reps: set.reps,
      weight: set.weight,
      orderIndex: setIndex,
    }));
  });
  return await tx.insert(exerciseSets).values(setsToInsert).returning();
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: UpdateWorkoutData
): Promise<Workout> {
  const values: UpdateWorkout = { updatedAt: new Date() };
  if (data.name !== undefined) values.name = data.name;
  if (data.performedAt !== undefined) values.performedAt = data.performedAt;
  if (data.notes !== undefined) values.notes = data.notes;

  return await db.transaction(async (tx) => {
    const [updatedWorkout] = await tx
      .update(workouts)
      .set(values)
      .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)))
      .returning();
    if (!updatedWorkout) throw new NotFoundError("Workout not found.");

    const workoutExercisesToUpdate = data.exercises;
    if (workoutExercisesToUpdate !== undefined) {
      await tx
        .delete(workoutExercises)
        .where(eq(workoutExercises.workoutId, workoutId));

      const createdWorkoutExercises = await createWorkoutExercises(
        tx,
        workoutId,
        workoutExercisesToUpdate
      );
      await createExerciseSets(
        tx,
        createdWorkoutExercises.map((obj) => obj.id),
        workoutExercisesToUpdate
      );
    }

    return updatedWorkout;
  });
}

export async function deleteWorkout(
  userId: string,
  workoutId: string
): Promise<void> {
  const [deletedRows] = await db
    .delete(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)))
    .returning({ id: workouts.id });
  if (!deletedRows) throw new NotFoundError("Workout not found.");
}

export async function getWorkoutDetails(
  userId: string,
  workoutId: string
): Promise<WorkoutDetails> {
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) throw new NotFoundError("Workout not found.");

  const workoutExercisesRows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      name: exercises.name,
      category: exercises.category,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.orderIndex);

  const exerciseSetsRows = await db
    .select({
      workoutExerciseId: exerciseSets.workoutExerciseId,
      reps: exerciseSets.reps,
      weight: exerciseSets.weight,
    })
    .from(exerciseSets)
    .where(
      inArray(
        exerciseSets.workoutExerciseId,
        workoutExercisesRows.map((e) => e.workoutExerciseId)
      )
    )
    .orderBy(exerciseSets.orderIndex);

  const setsByWorkoutExerciseId = new Map<
    number,
    WorkoutExerciseDetails["sets"]
  >();
  for (const set of exerciseSetsRows) {
    const sets = setsByWorkoutExerciseId.get(set.workoutExerciseId) ?? [];
    sets.push({
      reps: set.reps,
      weight: set.weight,
    });
    setsByWorkoutExerciseId.set(set.workoutExerciseId, sets);
  }

  const { userId: _, ...workoutData } = workout;
  const workoutDetails: WorkoutDetails = {
    ...workoutData,
    exercises: workoutExercisesRows.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      category: exercise.category,
      sets: setsByWorkoutExerciseId.get(exercise.workoutExerciseId) ?? [],
    })),
  };
  return workoutDetails;
}
