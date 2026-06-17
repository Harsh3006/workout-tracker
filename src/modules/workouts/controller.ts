import type { Request, Response } from "express";

import type { ExerciseRepository } from "../exercises/repository.js";
import type {
  CreateWorkoutData,
  UpdateWorkoutData,
  Workout,
} from "./models.js";
import type { WorkoutRepository } from "./repository.js";
import {
  getMissingExerciseIds,
  validateWorkoutExercisesData,
} from "./validators.js";

export function createWorkoutController(
  workoutRepository: WorkoutRepository,
  exerciseRepository: ExerciseRepository
) {
  {
    async function getAll(req: Request, res: Response) {
      const userId = req.user.id;
      const workouts = await workoutRepository.getByUserId(userId);
      res.json(workouts);
    }

    async function getById(req: Request<{ id: string }>, res: Response) {
      const userId = req.user.id;
      const workoutId = req.params.id;
      const workout = await workoutRepository.getById(workoutId, userId);
      if (!workout) {
        res.status(404).json({ message: "Workout not found" });
        return;
      }
      res.json(workout);
    }

    async function create(req: Request, res: Response) {
      const userId = req.user.id;
      const workoutData = req.body as CreateWorkoutData;
      if (!workoutData) {
        res.status(400).json({ message: "Workout data is required" });
        return;
      }

      if (
        !workoutData.name ||
        !workoutData.performedAt ||
        !workoutData.exercises
      ) {
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
    }

    async function update(req: Request<{ id: string }>, res: Response) {
      const userId = req.user.id;
      const workoutId = req.params.id;
      const workoutData = req.body as UpdateWorkoutData;

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

      const updateData: UpdateWorkoutData = {};
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
        const errorMessage = validateWorkoutExercisesData(
          workoutData.exercises
        );
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
    }

    async function remove(req: Request<{ id: string }>, res: Response) {
      const userId = req.user.id;
      const workoutId = req.params.id;
      try {
        await workoutRepository.delete(workoutId, userId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting workout:", error);
        res.status(404).json({ message: "Workout not found or unauthorized" });
      }
    }

    return {
      getAll,
      getById,
      create,
      update,
      remove,
    };
  }
}
