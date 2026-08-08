import { describe, expect, it, vi } from "vitest";

import { getExercises } from "@/modules/exercises/queries.js";
import { exerciseCategoryEnum } from "@/modules/exercises/schema.js";
import {
  getInvalidExerciseIds,
  validateExerciseCategory,
} from "@/modules/exercises/validators.js";
import { ValidationError } from "@/shared/errors.js";

vi.mock("@/modules/exercises/queries.js");

describe("validateExerciseCategory", () => {
  it("throws ValidationError for a non-string value", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(() => validateExerciseCategory(value)).toThrow(ValidationError);
    }
  });

  it("throws ValidationError for an invalid exercise category", () => {
    expect(() => validateExerciseCategory("invalid-category")).toThrow(
      ValidationError
    );
  });

  it("does not throw for a valid exercise category", () => {
    for (const category of exerciseCategoryEnum.enumValues) {
      expect(() => validateExerciseCategory(category)).not.toThrow();
    }
  });
});

describe("getInvalidExerciseIds", () => {
  function mockGetExercises(existingIds: number[]) {
    vi.mocked(getExercises).mockResolvedValue(
      existingIds.map((id) => ({ id })) as Awaited<
        ReturnType<typeof getExercises>
      >
    );
  }

  it("returns invalid exercise ids", async () => {
    mockGetExercises([1, 2, 3]);

    const exerciseIds = [1, 2, 3, 999];
    const result = await getInvalidExerciseIds(exerciseIds);
    expect(result).toEqual([999]);
    expect(getExercises).toHaveBeenCalledExactlyOnceWith({ exerciseIds });
  });

  it("returns an empty array when all exercise ids are valid", async () => {
    mockGetExercises([1, 2, 3]);

    const exerciseIds = [1, 2, 3];
    const result = await getInvalidExerciseIds(exerciseIds);
    expect(result).toEqual([]);
    expect(getExercises).toHaveBeenCalledExactlyOnceWith({ exerciseIds });
  });

  it("returns all exercise ids when none are valid", async () => {
    mockGetExercises([]);

    const exerciseIds = [1, 2, 3];
    const result = await getInvalidExerciseIds(exerciseIds);
    expect(result).toEqual([1, 2, 3]);
    expect(getExercises).toHaveBeenCalledExactlyOnceWith({ exerciseIds });
  });
});
