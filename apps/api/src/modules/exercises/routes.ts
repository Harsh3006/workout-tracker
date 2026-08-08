import { Router } from "express";

import { getAll, getById } from "./controllers.js";

const exerciseRouter = Router();

exerciseRouter.get("/", getAll);
exerciseRouter.get("/:id", getById);

export default exerciseRouter;
