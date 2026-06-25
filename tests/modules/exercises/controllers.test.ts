import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getAll, getById } from "../../../src/modules/exercises/controllers.js";
import {
  getExerciseById,
  getExercises,
} from "../../../src/modules/exercises/queries.js";
import { Exercise } from "../../../src/modules/exercises/schema.js";
import { NotFoundError, ValidationError } from "../../../src/shared/errors";

vi.mock("../../../src/modules/exercises/queries.js");

afterEach(() => vi.clearAllMocks());

function createMockResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

function createMockExercise(): Exercise {
  return {
    id: 1,
    name: "Bench Press",
    description: "Barbell chest press.",
    category: "chest",
    muscleGroups: ["chest", "front-deltoids", "triceps"],
  };
}

describe("getAll", () => {
  it("throws ValidationError for an invalid category", async () => {
    const req = { query: { category: "invalid" } } as unknown as Request;
    const res = createMockResponse();

    await expect(getAll(req, res)).rejects.toThrow(ValidationError);

    expect(getExercises).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns exercises for a valid category", async () => {
    const req = { query: { category: "chest" } } as unknown as Request;
    const res = createMockResponse();
    const mockExercise = createMockExercise();
    vi.mocked(getExercises).mockResolvedValue([mockExercise]);

    await getAll(req, res);

    expect(getExercises).toHaveBeenCalledExactlyOnceWith({ category: "chest" });
    expect(res.json).toHaveBeenCalledExactlyOnceWith([mockExercise]);
  });

  it("returns all exercises when no category is provided", async () => {
    const req = { query: {} } as unknown as Request;
    const res = createMockResponse();
    const mockExercise = createMockExercise();
    vi.mocked(getExercises).mockResolvedValue([mockExercise]);

    await getAll(req, res);

    expect(getExercises).toHaveBeenCalledExactlyOnceWith({
      category: undefined,
    });
    expect(res.json).toHaveBeenCalledExactlyOnceWith([mockExercise]);
  });
});

describe("getById", () => {
  it("throws ValidationError for a non numeric id", async () => {
    const req = { params: { id: "invalid" } } as unknown as Request;
    const res = createMockResponse();

    await expect(getById(req, res)).rejects.toThrow(ValidationError);

    expect(res.json).not.toHaveBeenCalled();
    expect(getExerciseById).not.toHaveBeenCalled();
  });

  it("throws NotFoundError for a non existing exercise", async () => {
    const req = { params: { id: "999" } } as unknown as Request;
    const res = createMockResponse();
    vi.mocked(getExerciseById).mockResolvedValue(undefined);

    await expect(getById(req, res)).rejects.toThrow(NotFoundError);

    expect(getExerciseById).toHaveBeenCalledExactlyOnceWith(999);
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns an exercise for a valid id", async () => {
    const req = { params: { id: "1" } } as unknown as Request;
    const res = createMockResponse();
    const mockExercise = createMockExercise();
    vi.mocked(getExerciseById).mockResolvedValue(mockExercise);

    await getById(req, res);

    expect(getExerciseById).toHaveBeenCalledExactlyOnceWith(1);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(mockExercise);
  });
});
