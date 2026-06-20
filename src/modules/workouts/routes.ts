import Router from "express";

import { createWorkoutController } from "./controller.js";

const workoutsRouter = Router();
const workoutController = createWorkoutController();

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
