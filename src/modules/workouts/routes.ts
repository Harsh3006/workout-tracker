import Router from "express";

import exercises from "../../data/exercises.json" with { type: "json" };
import workouts from "../../data/workouts.json" with { type: "json" };
import type { Exercise } from "../exercises/models.js";
import { ExerciseRepository } from "../exercises/repository.js";
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from "./models.js";
import { WorkoutRepository } from "./repository.js";
import {
  getMissingExerciseIds,
  validateWorkoutExercisesData,
} from "./validators.js";

const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);
const workoutRepository = new WorkoutRepository(workouts as Workout[]);

const workoutsRouter = Router();

workoutsRouter.get("/", async (req, res) => {
  const userId = req.user.id;
  const workouts = await workoutRepository.getByUserId(userId);
  res.json(workouts);
});

workoutsRouter.get("/:id", async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workout = await workoutRepository.getById(workoutId, userId);
  if (!workout) {
    res.status(404).json({ message: "Workout not found" });
    return;
  }
  res.json(workout);
});

workoutsRouter.delete("/:id", async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  try {
    await workoutRepository.delete(workoutId, userId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(404).json({ message: "Workout not found or unauthorized" });
  }
});

workoutsRouter.post("/", async (req, res) => {
  const userId = req.user.id;
  const workoutData = req.body as CreateWorkoutRequest;
  if (!workoutData) {
    res.status(400).json({ message: "Workout data is required" });
    return;
  }

  if (!workoutData.name || !workoutData.performedAt || !workoutData.exercises) {
    res.status(400).json({
      message: "Workout name, performedAt, and exercises are required",
    });
    return;
  }

  const exercises = workoutData.exercises;
  const errorMessage = validateWorkoutExercisesData(exercises);
  if (errorMessage) {
    res.status(400).json({ message: errorMessage });
    return;
  }

  const missingExerciseIds = await getMissingExerciseIds(
    exercises,
    exerciseRepository
  );
  if (missingExerciseIds.length > 0) {
    res.status(400).json({
      message: "One or more exercises do not exist",
      missingIds: missingExerciseIds,
    });
    return;
  }

  const newWorkout: Workout = {
    id: crypto.randomUUID(),
    userId,
    ...workoutData,
  };
  await workoutRepository.create(newWorkout);
  res.status(201).json(newWorkout);
});

workoutsRouter.patch("/:id", async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workoutData = req.body as UpdateWorkoutRequest;

  if (!workoutData) {
    res.status(400).json({ message: "Workout data is required" });
    return;
  }

  if (Object.keys(workoutData).length === 0) {
    res.status(400).json({
      message: "At least one field must be provided for update",
    });
    return;
  }

  const updateData: UpdateWorkoutRequest = {};
  if (workoutData.name) {
    updateData.name = workoutData.name;
  }
  if (workoutData.performedAt) {
    updateData.performedAt = workoutData.performedAt;
  }
  if (workoutData.notes !== undefined) {
    updateData.notes = workoutData.notes;
  }
  if (workoutData.exercises) {
    const errorMessage = validateWorkoutExercisesData(workoutData.exercises);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    const missingExerciseIds = await getMissingExerciseIds(
      workoutData.exercises,
      exerciseRepository
    );
    if (missingExerciseIds.length > 0) {
      res.status(400).json({
        message: "One or more exercises do not exist",
        missingIds: missingExerciseIds,
      });
      return;
    }
    updateData.exercises = workoutData.exercises;
  }

  const updatedWorkout = await workoutRepository.update(
    userId,
    workoutId,
    updateData
  );
  res.json(updatedWorkout);
});

export default workoutsRouter;
