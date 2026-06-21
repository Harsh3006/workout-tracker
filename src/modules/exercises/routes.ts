import { Router } from "express";

import { getAll, getById } from "./controller.js";

const exerciseRouter = Router();

exerciseRouter.get("/", getAll);
exerciseRouter.get("/:id", getById);

export default exerciseRouter;
