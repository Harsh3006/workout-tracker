import { Router } from "express";

import { createExercisesController } from "./controller.js";

const exerciseRouter = Router();
const exercisesController = createExercisesController();

exerciseRouter.get("/", exercisesController.getAll);
exerciseRouter.get("/:id", exercisesController.getById);

export default exerciseRouter;
