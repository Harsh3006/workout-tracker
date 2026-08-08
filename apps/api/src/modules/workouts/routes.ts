import Router from "express";

import { create, getAll, getById, remove, update } from "./controllers.js";

const workoutsRouter = Router();

workoutsRouter.route("/").get(getAll).post(create);
workoutsRouter.route("/:id").get(getById).patch(update).delete(remove);

export default workoutsRouter;
