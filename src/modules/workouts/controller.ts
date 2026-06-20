import type { Request, Response } from "express";

import {
  createWorkout,
  deleteWorkout,
  getWorkoutDetails,
  getWorkouts,
  updateWorkout,
} from "./queries.js";
import {
  validateCreateWorkoutData,
  validateUpdateWorkoutData,
} from "./validators.js";

export function createWorkoutController() {
  {
    async function getAll(req: Request, res: Response) {
      const userId = req.user.id;
      const workouts = await getWorkouts(userId);
      res.json(workouts);
    }

    async function getById(req: Request<{ id: string }>, res: Response) {
      const userId = req.user.id;
      const workoutId = req.params.id;
      try {
        const workout = await getWorkoutDetails(userId, workoutId);
        res.json(workout);
      } catch {
        res.status(404).json({ message: "Workout not found" });
        return;
      }
    }

    async function create(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const workoutData = await validateCreateWorkoutData(req.body);
        const workout = await createWorkout(userId, workoutData);
        res.status(201).json({
          message: "Workout created successfully",
          workoutId: workout.id,
        });
      } catch (error) {
        res.status(400).json({
          message:
            error instanceof Error ? error.message : "Invalid workout data",
        });
      }
    }

    async function update(req: Request<{ id: string }>, res: Response) {
      try {
        const userId = req.user.id;
        const workoutId = req.params.id;
        const workoutData = await validateUpdateWorkoutData(req.body);
        await updateWorkout(userId, workoutId, workoutData);
        res.status(200).json({ message: "Workout updated successfully" });
      } catch (error) {
        res.status(400).json({
          message:
            error instanceof Error ? error.message : "Invalid workout data",
        });
      }
    }

    async function remove(req: Request<{ id: string }>, res: Response) {
      const userId = req.user.id;
      const workoutId = req.params.id;
      try {
        await deleteWorkout(userId, workoutId);
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
