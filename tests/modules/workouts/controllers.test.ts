import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
  create,
  getAll,
  getById,
  remove,
  update,
} from "@/modules/workouts/controllers.js";
import {
  createWorkout,
  deleteWorkout,
  getWorkoutDetails,
  getWorkouts,
  updateWorkout,
} from "@/modules/workouts/queries.js";
import type { Workout, WorkoutDetails } from "@/modules/workouts/schema.js";
import type {
  CreateWorkoutData,
  UpdateWorkoutData,
} from "@/modules/workouts/types.js";
import {
  validateCreateWorkoutData,
  validateUpdateWorkoutData,
} from "@/modules/workouts/validators.js";
import { ValidationError } from "@/shared/errors.js";

vi.mock("@/modules/workouts/queries.js");
vi.mock("@/modules/workouts/validators.js");

const userId = "user-1";
const workoutId = "workout-1";

function createMockRequest(overrides = {}): Request {
  return {
    user: { id: userId, email: "john@example.com" },
    params: {},
    body: {},
    ...overrides,
  } as unknown as Request;
}

function createMockRequestWithId(overrides = {}) {
  return {
    user: { id: userId, email: "john@example.com" },
    params: { id: workoutId },
    body: {},
    ...overrides,
  } as unknown as Request<{ id: string }>;
}

function createMockResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;
}

function createMockWorkout(overrides = {}): Workout {
  const now = new Date("2026-07-06T10:00:00.000Z");
  return {
    id: workoutId,
    userId,
    name: "Chest Day",
    performedAt: now,
    notes: "Felt strong.",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createWorkoutData(overrides = {}): CreateWorkoutData {
  return {
    name: "Chest Day",
    performedAt: new Date("2026-07-06T10:00:00.000Z"),
    notes: "Felt strong.",
    exercises: [{ exerciseId: 1, sets: [{ reps: 10, weight: 50 }] }],
    ...overrides,
  };
}

describe("getAll", () => {
  it("returns workouts for the authenticated user", async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const workouts = [createMockWorkout()];
    vi.mocked(getWorkouts).mockResolvedValue(workouts);

    await getAll(req, res);

    expect(getWorkouts).toHaveBeenCalledExactlyOnceWith(userId);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(workouts);
  });
});

describe("getById", () => {
  it("returns workout details for the authenticated user", async () => {
    const req = createMockRequestWithId();
    const res = createMockResponse();
    const { userId: _, ...workout } = createMockWorkout();
    const workoutDetails: WorkoutDetails = {
      ...workout,
      exercises: [
        {
          exerciseId: 1,
          name: "Bench Press",
          category: "chest",
          sets: [{ reps: 10, weight: 50 }],
        },
      ],
    };
    vi.mocked(getWorkoutDetails).mockResolvedValue(workoutDetails);

    await getById(req, res);

    expect(getWorkoutDetails).toHaveBeenCalledExactlyOnceWith(
      userId,
      workoutId
    );
    expect(res.json).toHaveBeenCalledExactlyOnceWith(workoutDetails);
  });
});

describe("create", () => {
  it("creates a workout for valid input", async () => {
    const body = { name: "  Chest Day  " };
    const req = createMockRequest({ body });
    const res = createMockResponse();
    const workoutData = createWorkoutData();
    const workout = createMockWorkout();
    vi.mocked(validateCreateWorkoutData).mockResolvedValue(workoutData);
    vi.mocked(createWorkout).mockResolvedValue(workout);

    await create(req, res);

    expect(validateCreateWorkoutData).toHaveBeenCalledExactlyOnceWith(body);
    expect(createWorkout).toHaveBeenCalledExactlyOnceWith(userId, workoutData);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "Workout created successfully.",
      workoutId,
    });
  });

  it("throws ValidationError and does not create workout for invalid input", async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();
    vi.mocked(validateCreateWorkoutData).mockRejectedValue(
      new ValidationError("Workout data is required.")
    );

    await expect(create(req, res)).rejects.toThrow(ValidationError);

    expect(validateCreateWorkoutData).toHaveBeenCalledExactlyOnceWith(req.body);
    expect(createWorkout).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("updates a workout for valid input", async () => {
    const body = { name: "  Chest Day  " };
    const req = createMockRequestWithId({ body });
    const res = createMockResponse();
    const workoutData: UpdateWorkoutData = { name: "Chest Day" };
    vi.mocked(validateUpdateWorkoutData).mockResolvedValue(workoutData);
    vi.mocked(updateWorkout).mockResolvedValue(createMockWorkout());

    await update(req, res);

    expect(validateUpdateWorkoutData).toHaveBeenCalledExactlyOnceWith(body);
    expect(updateWorkout).toHaveBeenCalledExactlyOnceWith(
      userId,
      workoutId,
      workoutData
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "Workout updated successfully.",
    });
  });

  it("throws ValidationError and does not update workout for invalid input", async () => {
    const req = createMockRequestWithId({ body: {} });
    const res = createMockResponse();
    vi.mocked(validateUpdateWorkoutData).mockRejectedValue(
      new ValidationError("At least one field must be provided for update.")
    );

    await expect(update(req, res)).rejects.toThrow(ValidationError);

    expect(validateUpdateWorkoutData).toHaveBeenCalledExactlyOnceWith(req.body);
    expect(updateWorkout).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("remove", () => {
  it("deletes a workout for the authenticated user", async () => {
    const req = createMockRequestWithId();
    const res = createMockResponse();
    vi.mocked(deleteWorkout).mockResolvedValue(undefined);

    await remove(req, res);

    expect(deleteWorkout).toHaveBeenCalledExactlyOnceWith(userId, workoutId);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
    expect(res.send).toHaveBeenCalledOnce();
  });
});
