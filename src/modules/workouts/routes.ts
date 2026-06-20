import Router from "express";

import workouts from "../../data/workouts.json" with { type: "json" };
import { createWorkoutController } from "./controller.js";
import type { Workout } from "./models.js";
import { WorkoutRepository } from "./repository.js";

const workoutsRouter = Router();
const workoutRepository = new WorkoutRepository(workouts as Workout[]);
const workoutController = createWorkoutController(workoutRepository);

workoutsRouter
  .route("/")
  .get(workoutController.getAll)
  .post(workoutController.create);

workoutsRouter
  .route("/:id")
  .get(workoutController.getById)
  .patch(workoutController.update)
  .delete(workoutController.remove);

export default workoutsRouter;
