import Router from "express";

import workouts from "../../data/workouts.json" with { type: "json" };
import type { Workout } from "./models.js";
import { WorkoutRepository } from "./repository.js";

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

export default workoutsRouter;
