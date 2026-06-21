import type { RequestHandler } from "express";

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

export const getAll: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const workouts = await getWorkouts(userId);
  res.json(workouts);
};

export const getById: RequestHandler<{ id: string }> = async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workout = await getWorkoutDetails(userId, workoutId);
  res.json(workout);
};

export const create: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const workoutData = await validateCreateWorkoutData(req.body);
  const workout = await createWorkout(userId, workoutData);
  res.status(201).json({
    message: "Workout created successfully.",
    workoutId: workout.id,
  });
};

export const update: RequestHandler<{ id: string }> = async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  const workoutData = await validateUpdateWorkoutData(req.body);
  await updateWorkout(userId, workoutId, workoutData);
  res.status(200).json({ message: "Workout updated successfully." });
};

export const remove: RequestHandler<{ id: string }> = async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.id;
  await deleteWorkout(userId, workoutId);
  res.status(204).send();
};
