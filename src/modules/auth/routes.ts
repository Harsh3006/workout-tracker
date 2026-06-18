import Router from "express";

import users from "../../data/users.json" with { type: "json" };
import type { User } from "../users/models.js";
import { UserRepository } from "../users/repository.js";
import { createAuthController } from "./controller.js";

const authRouter = Router();
const userRepository = new UserRepository(users as User[]);
const authController = createAuthController(userRepository);

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);

export default authRouter;
