import { describe, expect, it } from "vitest";

import { getExerciseById, getExercises } from "@/modules/exercises/queries.js";

import { seedExercises } from "../../fixtures/exercises.js";

describe("getExerciseById", () => {
  it("returns undefined if the exercise does not exist", async () => {
    const exercise = await getExerciseById(999);
    expect(exercise).toBeUndefined();
  });

  it("returns the exercise if it exists", async () => {
    const { squat } = await seedExercises();
    const exercise = await getExerciseById(squat.id);
    expect(exercise).toEqual(squat);
  });
});

describe("getExercises", () => {
  it("returns all exercises if no parameters are provided", async () => {
    const { exercises } = await seedExercises();
    const result = await getExercises();
    expect(result).toEqual(exercises);
  });

  it("returns exercises filtered by exerciseIds", async () => {
    const { squat, benchPress } = await seedExercises();
    const result = await getExercises({
      exerciseIds: [squat.id, benchPress.id],
    });
    expect(result).toEqual([squat, benchPress]);
  });

  it("returns exercises filtered by category", async () => {
    const { benchPress } = await seedExercises();
    const result = await getExercises({ category: "chest" });
    expect(result).toEqual([benchPress]);
  });
});
