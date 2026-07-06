import { afterEach, describe, expect, it, vi } from "vitest";

import { getInvalidExerciseIds } from "@/modules/exercises/validators.js";
import type { CreateWorkoutData } from "@/modules/workouts/types.js";
import {
  validateCreateWorkoutData,
  validateUpdateWorkoutData,
  validateWorkoutExercisesData,
} from "@/modules/workouts/validators.js";
import { ValidationError } from "@/shared/errors.js";

vi.mock("@/modules/exercises/validators.js");

afterEach(() => vi.clearAllMocks());

function createWorkoutData(overrides = {}): CreateWorkoutData {
  return {
    name: "Chest Day",
    performedAt: new Date(),
    notes: "Just started working out again.",
    exercises: [{ exerciseId: 1, sets: [{ reps: 10, weight: 50 }] }],
    ...overrides,
  };
}

function mockInvalidExerciseIds(invalidExerciseIds: number[] = []) {
  vi.mocked(getInvalidExerciseIds).mockResolvedValue(invalidExerciseIds);
}

describe("validateWorkoutExercisesData", () => {
  it("throws ValidationError if exercises is not an array", () => {
    const invalidValues = [null, undefined, {}, "string", 123, true];
    for (const value of invalidValues) {
      expect(() => validateWorkoutExercisesData(value)).toThrow(
        ValidationError
      );
    }
  });

  it("throws ValidationError if exercises array is empty", () => {
    expect(() => validateWorkoutExercisesData([])).toThrow(ValidationError);
  });

  it("throws ValidationError if each entry is not an object with a numeric exerciseId", () => {
    const invalidExercises = [
      "exercise is not an object",
      { exerciseId: "not-a-number" },
    ];
    for (const exercise of invalidExercises) {
      expect(() => validateWorkoutExercisesData([exercise])).toThrow(
        ValidationError
      );
    }
  });

  it("throws ValidationError if each exercise does not have at least one set", () => {
    const invalidExercises = [
      { exerciseId: 1, sets: [] },
      { exerciseId: 2, sets: "not-an-array" },
    ];
    for (const exercise of invalidExercises) {
      expect(() => validateWorkoutExercisesData([exercise])).toThrow(
        ValidationError
      );
    }
  });

  it("throws ValidationError if each set does not have numeric reps and weight", () => {
    const invalidExercises = [
      { exerciseId: 1, sets: [{ reps: "not-a-number", weight: 10 }] },
      { exerciseId: 2, sets: [{ reps: 10, weight: "not-a-number" }] },
    ];
    for (const exercise of invalidExercises) {
      expect(() => validateWorkoutExercisesData([exercise])).toThrow(
        ValidationError
      );
    }
  });

  it("throws ValidationError if reps is less than or equal to 0", () => {
    const invalidExercises = [
      { exerciseId: 1, sets: [{ reps: 0, weight: 10 }] },
      { exerciseId: 2, sets: [{ reps: -5, weight: 10 }] },
    ];
    for (const exercise of invalidExercises) {
      expect(() => validateWorkoutExercisesData([exercise])).toThrow(
        ValidationError
      );
    }
  });

  it("throws ValidationError if weight is negative", () => {
    const invalidExercises = [
      { exerciseId: 1, sets: [{ reps: 10, weight: -5 }] },
      { exerciseId: 2, sets: [{ reps: 10, weight: -1 }] },
    ];
    for (const exercise of invalidExercises) {
      expect(() => validateWorkoutExercisesData([exercise])).toThrow(
        ValidationError
      );
    }
  });

  it("does not throw an error for valid exercises data", () => {
    const validExercises = [
      { exerciseId: 1, sets: [{ reps: 1, weight: 0 }] },
      { exerciseId: 2, sets: [{ reps: 10, weight: 50 }] },
      {
        exerciseId: 3,
        sets: [
          { reps: 8, weight: 60 },
          { reps: 6, weight: 70 },
        ],
      },
    ];
    expect(() => validateWorkoutExercisesData(validExercises)).not.toThrow();
  });
});

describe("validateCreateWorkoutData", () => {
  it("throws ValidationError if data is not an object", async () => {
    const invalidValues = [null, undefined, "string", 123, true];
    for (const value of invalidValues) {
      await expect(validateCreateWorkoutData(value)).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if name is a empty string", async () => {
    const invalidNames = ["", "   ", "\n"];
    for (const name of invalidNames) {
      const data = createWorkoutData({ name });
      await expect(validateCreateWorkoutData(data)).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if performedAt is invalid", async () => {
    const invalidDates = ["", "not-a-date"];
    for (const performedAt of invalidDates) {
      const data = createWorkoutData({
        performedAt: performedAt as unknown as Date,
      });

      await expect(validateCreateWorkoutData(data)).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if exercises data is invalid", async () => {
    const data = createWorkoutData({ exercises: [] });

    await expect(validateCreateWorkoutData(data)).rejects.toThrow(
      ValidationError
    );
    expect(getInvalidExerciseIds).not.toHaveBeenCalled();
  });

  it("throws ValidationError if one or more exercises do not exist", async () => {
    mockInvalidExerciseIds([999]);
    const data = createWorkoutData({
      exercises: [{ exerciseId: 999, sets: [{ reps: 10, weight: 50 }] }],
    });

    await expect(validateCreateWorkoutData(data)).rejects.toThrow(
      ValidationError
    );
    expect(getInvalidExerciseIds).toHaveBeenCalledExactlyOnceWith([999]);
  });

  it("returns trimmed and normalized workout data for valid input", async () => {
    mockInvalidExerciseIds();
    const performedAt = "2026-07-06T10:00:00.000Z" as unknown as Date;
    const exercises = [{ exerciseId: 1, sets: [{ reps: 10, weight: 50 }] }];
    const data = createWorkoutData({
      name: "  Chest Day  ",
      performedAt,
      notes: "  Felt strong  ",
      exercises,
    });

    await expect(validateCreateWorkoutData(data)).resolves.toEqual({
      name: "Chest Day",
      performedAt: new Date(performedAt),
      notes: "Felt strong",
      exercises,
    });
    expect(getInvalidExerciseIds).toHaveBeenCalledExactlyOnceWith([1]);
  });

  it("omits blank notes for valid input", async () => {
    mockInvalidExerciseIds();
    const data = createWorkoutData({ notes: "   " });

    await expect(validateCreateWorkoutData(data)).resolves.toEqual({
      name: data.name,
      performedAt: data.performedAt,
      notes: undefined,
      exercises: data.exercises,
    });
    expect(getInvalidExerciseIds).toHaveBeenCalledExactlyOnceWith([1]);
  });
});

describe("validateUpdateWorkoutData", () => {
  it("throws ValidationError if data is not an object", async () => {
    const invalidValues = [null, undefined, "string", 123, true];
    for (const value of invalidValues) {
      await expect(validateUpdateWorkoutData(value)).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if no update fields are provided", async () => {
    await expect(validateUpdateWorkoutData({})).rejects.toThrow(
      ValidationError
    );
    expect(getInvalidExerciseIds).not.toHaveBeenCalled();
  });

  it("throws ValidationError if name is not a non-empty string", async () => {
    const invalidNames = ["", "   ", 123, null];
    for (const name of invalidNames) {
      await expect(validateUpdateWorkoutData({ name })).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if performedAt is invalid", async () => {
    const invalidDates = ["", "not-a-date"];
    for (const performedAt of invalidDates) {
      await expect(validateUpdateWorkoutData({ performedAt })).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if notes is not a string or null", async () => {
    const invalidNotes = [123, true, {}];
    for (const notes of invalidNotes) {
      await expect(validateUpdateWorkoutData({ notes })).rejects.toThrow(
        ValidationError
      );
      expect(getInvalidExerciseIds).not.toHaveBeenCalled();
    }
  });

  it("throws ValidationError if exercises data is invalid", async () => {
    await expect(validateUpdateWorkoutData({ exercises: [] })).rejects.toThrow(
      ValidationError
    );
    expect(getInvalidExerciseIds).not.toHaveBeenCalled();
  });

  it("throws ValidationError if one or more exercises do not exist", async () => {
    mockInvalidExerciseIds([999]);
    const exercises = [{ exerciseId: 999, sets: [{ reps: 10, weight: 50 }] }];

    await expect(validateUpdateWorkoutData({ exercises })).rejects.toThrow(
      ValidationError
    );
    expect(getInvalidExerciseIds).toHaveBeenCalledExactlyOnceWith([999]);
  });

  it("returns normalized update data for valid input", async () => {
    mockInvalidExerciseIds();
    const performedAt = "2026-07-06T10:00:00.000Z";
    const exercises = [{ exerciseId: 1, sets: [{ reps: 10, weight: 50 }] }];

    await expect(
      validateUpdateWorkoutData({
        name: "  Chest Day  ",
        performedAt,
        notes: "  Felt strong  ",
        exercises,
      })
    ).resolves.toEqual({
      name: "Chest Day",
      performedAt: new Date(performedAt),
      notes: "Felt strong",
      exercises,
    });
    expect(getInvalidExerciseIds).toHaveBeenCalledExactlyOnceWith([1]);
  });

  it("allows notes to be cleared with null", async () => {
    await expect(validateUpdateWorkoutData({ notes: null })).resolves.toEqual({
      notes: undefined,
    });
    expect(getInvalidExerciseIds).not.toHaveBeenCalled();
  });
});
