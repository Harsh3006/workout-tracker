import Router from "express";

import { createAuthController } from "./controller.js";

const authRouter = Router();
const authController = createAuthController();

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);

export default authRouter;
