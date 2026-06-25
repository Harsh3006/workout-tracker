import { afterEach, describe, expect, it, vi } from "vitest";

import { getExercises } from "../../../src/modules/exercises/queries.js";
import { exerciseCategoryEnum } from "../../../src/modules/exercises/schema.js";
import {
  getInvalidExerciseIds,
  isExerciseCategory,
} from "../../../src/modules/exercises/validators.js";

vi.mock("../../../src/modules/exercises/queries.js");

afterEach(() => vi.clearAllMocks());

describe("isExerciseCategory", () => {
  it("returns false for a non-string value", () => {
    const values = [123, null, undefined, {}, [], true, false];
    for (const value of values) {
      expect(isExerciseCategory(value)).toBe(false);
    }
  });

  it("returns false for an invalid exercise category", () => {
    expect(isExerciseCategory("invalid-category")).toBe(false);
  });

  it("returns true for a valid exercise category", () => {
    for (const category of exerciseCategoryEnum.enumValues) {
      expect(isExerciseCategory(category)).toBe(true);
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
