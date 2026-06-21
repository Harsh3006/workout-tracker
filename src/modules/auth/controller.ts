import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

import { JWT_SECRET } from "../../config/env.js";
import {
  ConflictError,
  UnauthenticatedError,
  ValidationError,
} from "../../shared/errors.js";
import { createUser, getUserByEmail } from "../users/queries.js";
import type { NewUser } from "../users/schema.js";
import { isValidEmail, isValidPassword } from "../users/validators.js";

export function createAuthController() {
  {
    async function signup(req: Request, res: Response) {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName)
        throw new ValidationError("Missing required fields.");
      if (!isValidEmail(email))
        throw new ValidationError("Invalid email format.");
      if (!isValidPassword(password))
        throw new ValidationError("Password must be at least 8 characters.");

      const existingUser = await getUserByEmail(email);
      if (existingUser) throw new ConflictError("Email already in use.");

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: NewUser = {
        email,
        passwordHash,
        firstName,
        lastName,
      };
      await createUser(newUser);
      res.status(201).json({ message: "User created successfully." });
    }

    async function login(req: Request, res: Response) {
      const { email, password } = req.body;
      if (!email || !password)
        throw new ValidationError("Missing email or password.");
      if (!isValidEmail(email))
        throw new ValidationError("Invalid email format.");
      if (!isValidPassword(password))
        throw new ValidationError("Password must be at least 8 characters.");

      const user = await getUserByEmail(email);
      if (!user) throw new UnauthenticatedError("Invalid email or password.");

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch)
        throw new UnauthenticatedError("Invalid email or password.");

      const token = jsonwebtoken.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ message: "Logged in successfully.", token: token });
    }

    return { signup, login };
  }
}
