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

export async function getAll(req: Request, res: Response) {
  const userId = req.user.id;
  const workouts = await getWorkouts(userId);
  res.json(workouts);
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workout = await getWorkoutDetails(userId, workoutId);
  res.json(workout);
}

export async function create(req: Request, res: Response) {
  const userId = req.user.id;
  const workoutData = await validateCreateWorkoutData(req.body);
  const workout = await createWorkout(userId, workoutData);
  res.status(201).json({
    message: "Workout created successfully.",
    workoutId: workout.id,
  });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workoutData = await validateUpdateWorkoutData(req.body);
  await updateWorkout(userId, workoutId, workoutData);
  res.status(200).json({ message: "Workout updated successfully." });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  const userId = req.user.id;
  const workoutId = req.params.id;
  await deleteWorkout(userId, workoutId);
  res.status(204).send();
}
