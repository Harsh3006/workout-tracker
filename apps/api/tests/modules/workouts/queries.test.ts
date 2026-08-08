import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/db.js";
import {
  createWorkout,
  deleteWorkout,
  getWorkoutById,
  getWorkoutDetails,
  getWorkouts,
  updateWorkout,
} from "@/modules/workouts/queries.js";
import {
  exerciseSets,
  workoutExercises,
  workouts,
} from "@/modules/workouts/schema.js";
import type { CreateWorkoutData } from "@/modules/workouts/types.js";
import { NotFoundError } from "@/shared/errors.js";

import { seedExercises } from "../../fixtures/exercises.js";
import { seedUser } from "../../fixtures/users.js";
import {
  seedWorkout,
  seedWorkoutExercisesWithSets,
} from "../../fixtures/workouts.js";

describe("getWorkouts", () => {
  it("returns all workouts for the user", async () => {
    const user = await seedUser();
    const workout = await seedWorkout(user);
    const result = await getWorkouts(user.id);
    expect(result).toMatchObject([workout]);
  });

  it("returns an empty array when the user has no workouts", async () => {
    const user = await seedUser();
    const result = await getWorkouts(user.id);
    expect(result).toEqual([]);
  });

  it("does not return workouts belonging to other users", async () => {
    const user1 = await seedUser();
    const workout1 = await seedWorkout(user1);

    const user2 = await seedUser({ email: "another@user.com" });
    await seedWorkout(user2);

    const result = await getWorkouts(user1.id);
    expect(result).toHaveLength(1);
    expect(result).toMatchObject([workout1]);
  });
});

describe("getWorkoutById", () => {
  it("returns the specified workout for the user", async () => {
    const user = await seedUser();
    const workout = await seedWorkout(user);
    const result = await getWorkoutById(user.id, workout.id);
    expect(result).toMatchObject(workout);
  });

  it("returns undefined if the workout does not exist", async () => {
    const user = await seedUser();
    const result = await getWorkoutById(user.id, randomUUID());
    expect(result).toBeUndefined();
  });

  it("returns undefined if the workout belongs to another user", async () => {
    const user1 = await seedUser();
    const workout = await seedWorkout(user1);
    const user2 = await seedUser({ email: "another@user.com" });
    const result = await getWorkoutById(user2.id, workout.id);
    expect(result).toBeUndefined();
  });
});

describe("createWorkout", () => {
  it("creates a workout with exercises and exercise sets", async () => {
    const user = await seedUser();
    const { squat, latPulldown } = await seedExercises();

    const workoutData: CreateWorkoutData = {
      name: "Test Workout",
      performedAt: new Date(),
      notes: "This is a test workout.",
      exercises: [
        {
          exerciseId: squat.id,
          sets: [
            { reps: 5, weight: 100 },
            { reps: 3, weight: 120 },
          ],
        },
        {
          exerciseId: latPulldown.id,
          sets: [{ reps: 10, weight: 50 }],
        },
      ],
    };

    const workout = await createWorkout(user.id, workoutData);
    expect(workout).toMatchObject({
      id: expect.any(String),
      userId: user.id,
      name: workoutData.name,
      performedAt: workoutData.performedAt,
      notes: workoutData.notes,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const exercises = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id));
    expect(exercises).toHaveLength(2);

    expect(exercises[0]).toMatchObject({
      workoutId: workout.id,
      exerciseId: squat.id,
      orderIndex: 0,
    });

    expect(exercises[1]).toMatchObject({
      workoutId: workout.id,
      exerciseId: latPulldown.id,
      orderIndex: 1,
    });

    const squatSets = await db
      .select()
      .from(exerciseSets)
      .where(eq(exerciseSets.workoutExerciseId, exercises[0]!.id));
    expect(squatSets).toHaveLength(2);

    expect(squatSets[0]).toMatchObject({
      workoutExerciseId: exercises[0]!.id,
      reps: 5,
      weight: 100,
      orderIndex: 0,
    });

    expect(squatSets[1]).toMatchObject({
      workoutExerciseId: exercises[0]!.id,
      reps: 3,
      weight: 120,
      orderIndex: 1,
    });

    const latPulldownSets = await db
      .select()
      .from(exerciseSets)
      .where(eq(exerciseSets.workoutExerciseId, exercises[1]!.id));

    expect(latPulldownSets).toHaveLength(1);

    expect(latPulldownSets[0]).toMatchObject({
      workoutExerciseId: exercises[1]!.id,
      reps: 10,
      weight: 50,
      orderIndex: 0,
    });
  });

  it("creates a workout when notes are omitted", async () => {
    const user = await seedUser();
    const { squat } = await seedExercises();

    const workout = await createWorkout(user.id, {
      name: "Push Day",
      performedAt: new Date(),
      exercises: [
        {
          exerciseId: squat.id,
          sets: [{ reps: 5, weight: 100 }],
        },
      ],
    });

    expect(workout.notes).toBeNull();
  });

  it("rolls back the entire transaction when an exercise does not exist", async () => {
    const user = await seedUser();

    await expect(
      createWorkout(user.id, {
        name: "Workout",
        performedAt: new Date(),
        exercises: [
          {
            exerciseId: 99999,
            sets: [{ reps: 5, weight: 100 }],
          },
        ],
      })
    ).rejects.toThrow();

    await expectNoWorkoutData();
  });

  it("rolls back the entire transaction when an exercise set is invalid", async () => {
    const user = await seedUser();
    const { squat } = await seedExercises();

    await expect(
      createWorkout(user.id, {
        name: "Workout",
        performedAt: new Date(),
        exercises: [
          {
            exerciseId: squat.id,
            sets: [{ reps: -5, weight: 100 }],
          },
        ],
      })
    ).rejects.toThrow();

    await expectNoWorkoutData();
  });
});

describe("updateWorkout", () => {
  it("updates a workout's name, performedAt, and notes", async () => {
    const user = await seedUser();
    const workout = await seedWorkout(user);

    const newName = "Updated Workout Name";
    const newPerformedAt = new Date();
    const newNotes = "Updated notes for the workout.";

    const updatedWorkout = await updateWorkout(user.id, workout.id, {
      name: newName,
      performedAt: newPerformedAt,
      notes: newNotes,
    });

    expect(updatedWorkout).toMatchObject({
      id: workout.id,
      userId: user.id,
      name: newName,
      performedAt: newPerformedAt,
      notes: newNotes,
    });
  });

  it("does not update fields that are not provided", async () => {
    const user = await seedUser();
    const workout = await seedWorkout(user);

    const updatedWorkout = await updateWorkout(user.id, workout.id, {
      name: "Partially Updated Workout Name",
    });

    expect(updatedWorkout.name).toBe("Partially Updated Workout Name");
    expect(updatedWorkout.performedAt).toEqual(workout.performedAt);
    expect(updatedWorkout.notes).toBe(workout.notes);
  });

  it("replaces existing workout exercises and exercise sets", async () => {
    const user = await seedUser();
    const { squat, benchPress } = await seedExercises();
    const workout = await seedWorkout(user);

    await seedWorkoutExercisesWithSets(workout.id, [
      {
        exerciseId: squat.id,
        sets: [{ reps: 5, weight: 100 }],
      },
    ]);

    await updateWorkout(user.id, workout.id, {
      exercises: [
        {
          exerciseId: benchPress.id,
          sets: [{ reps: 8, weight: 150 }],
        },
      ],
    });

    await expectWorkoutState(workout.id, benchPress.id, 8, 150);
  });

  it("throws NotFoundError if the workout does not exist", async () => {
    const user = await seedUser();

    await expect(
      updateWorkout(user.id, randomUUID(), {
        name: "Updated",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError if the workout does not belong to the user", async () => {
    const user1 = await seedUser();
    const user2 = await seedUser({ email: "another@user.com" });
    const workout = await seedWorkout(user1);

    await expect(
      updateWorkout(user2.id, workout.id, {
        name: "Updated",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("rolls back the entire transaction when an exercise does not exist", async () => {
    const user = await seedUser();
    const { squat } = await seedExercises();
    const workout = await seedWorkout(user);

    await seedWorkoutExercisesWithSets(workout.id, [
      {
        exerciseId: squat.id,
        sets: [{ reps: 5, weight: 100 }],
      },
    ]);

    await expect(
      updateWorkout(user.id, workout.id, {
        exercises: [
          {
            exerciseId: 99999,
            sets: [{ reps: 5, weight: 100 }],
          },
        ],
      })
    ).rejects.toThrow();

    await expectWorkoutState(workout.id, squat.id, 5, 100);
  });

  it("rolls back the entire transaction when an exercise set is invalid", async () => {
    const user = await seedUser();
    const { squat } = await seedExercises();
    const workout = await seedWorkout(user);

    await seedWorkoutExercisesWithSets(workout.id, [
      {
        exerciseId: squat.id,
        sets: [{ reps: 5, weight: 100 }],
      },
    ]);

    await expect(
      updateWorkout(user.id, workout.id, {
        exercises: [
          {
            exerciseId: squat.id,
            sets: [{ reps: -5, weight: 100 }],
          },
        ],
      })
    ).rejects.toThrow();

    await expectWorkoutState(workout.id, squat.id, 5, 100);
  });
});

describe("deleteWorkout", () => {
  it("deletes a workout and its associated exercises and sets", async () => {
    const user = await seedUser();
    const { squat } = await seedExercises();
    const workout = await seedWorkout(user);
    await seedWorkoutExercisesWithSets(workout.id, [
      {
        exerciseId: squat.id,
        sets: [{ reps: 5, weight: 100 }],
      },
    ]);

    await deleteWorkout(user.id, workout.id);
    expect(await getWorkoutById(user.id, workout.id)).toBeUndefined();
    await expectNoWorkoutData();
  });

  it("throws NotFoundError if the workout does not exist", async () => {
    const user = await seedUser();
    await expect(deleteWorkout(user.id, randomUUID())).rejects.toThrow(
      NotFoundError
    );
  });

  it("throws NotFoundError if the workout does not belong to the user", async () => {
    const user1 = await seedUser();
    const user2 = await seedUser({ email: "another@user.com" });
    const workout = await seedWorkout(user1);

    await expect(deleteWorkout(user2.id, workout.id)).rejects.toThrow(
      NotFoundError
    );
    expect(await getWorkoutById(user1.id, workout.id)).toMatchObject(workout);
  });
});

describe("getWorkoutDetails", () => {
  it("returns workout details with exercises and sets", async () => {
    const user = await seedUser();
    const { squat, benchPress } = await seedExercises();
    const workout = await seedWorkout(user);

    await seedWorkoutExercisesWithSets(workout.id, [
      {
        exerciseId: squat.id,
        sets: [
          { reps: 5, weight: 100 },
          { reps: 3, weight: 120 },
        ],
      },
      {
        exerciseId: benchPress.id,
        sets: [{ reps: 8, weight: 150 }],
      },
    ]);

    const details = await getWorkoutDetails(user.id, workout.id);

    expect(details).toMatchObject({
      id: workout.id,
      name: workout.name,
      performedAt: workout.performedAt,
      notes: workout.notes,
      exercises: [
        {
          exerciseId: squat.id,
          name: squat.name,
          category: squat.category,
          sets: [
            { reps: 5, weight: 100 },
            { reps: 3, weight: 120 },
          ],
        },
        {
          exerciseId: benchPress.id,
          name: benchPress.name,
          category: benchPress.category,
          sets: [{ reps: 8, weight: 150 }],
        },
      ],
    });
  });

  it("throws NotFoundError if the workout does not exist", async () => {
    const user = await seedUser();

    await expect(getWorkoutDetails(user.id, randomUUID())).rejects.toThrow(
      NotFoundError
    );
  });

  it("throws NotFoundError if the workout does not belong to the user", async () => {
    const user1 = await seedUser();
    const user2 = await seedUser({ email: "another@user.com" });
    const workout = await seedWorkout(user1);

    await expect(getWorkoutDetails(user2.id, workout.id)).rejects.toThrow(
      NotFoundError
    );
  });
});

async function expectNoWorkoutData() {
  expect(await db.select().from(workouts)).toHaveLength(0);
  expect(await db.select().from(workoutExercises)).toHaveLength(0);
  expect(await db.select().from(exerciseSets)).toHaveLength(0);
}

async function expectWorkoutState(
  workoutId: string,
  exerciseId: number,
  reps: number,
  weight: number
) {
  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  expect(exercises).toHaveLength(1);
  expect(exercises[0]).toMatchObject({
    workoutId,
    exerciseId,
    orderIndex: 0,
  });

  const sets = await db
    .select()
    .from(exerciseSets)
    .where(eq(exerciseSets.workoutExerciseId, exercises[0]!.id));

  expect(sets).toHaveLength(1);
  expect(sets[0]).toMatchObject({
    workoutExerciseId: exercises[0]!.id,
    reps,
    weight,
    orderIndex: 0,
  });
}
