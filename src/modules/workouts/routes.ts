import Router from "express";

import exercises from "../../data/exercises.json" with { type: "json" };
import workouts from "../../data/workouts.json" with { type: "json" };
import type { Exercise } from "../exercises/models.js";
import { ExerciseRepository } from "../exercises/repository.js";
import { createWorkoutController } from "./controller.js";
import type { Workout } from "./models.js";
import { WorkoutRepository } from "./repository.js";

const workoutsRouter = Router();
const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);
const workoutRepository = new WorkoutRepository(workouts as Workout[]);
const workoutController = createWorkoutController(
  workoutRepository,
  exerciseRepository
);

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
