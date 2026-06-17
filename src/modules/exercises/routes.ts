import { Router } from "express";

import exercises from "../../data/exercises.json" with { type: "json" };
import { createExercisesController } from "./controller.js";
import type { Exercise } from "./models.js";
import { ExerciseRepository } from "./repository.js";

const exerciseRouter = Router();
const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);
const exercisesController = createExercisesController(exerciseRepository);

exerciseRouter.get("/", exercisesController.getAll);
exerciseRouter.get("/:id", exercisesController.getById);

export default exerciseRouter;
