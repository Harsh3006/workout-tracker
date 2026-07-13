import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

import { createUser, getUserByEmail } from "@/modules/users/queries.js";
import type { NewUser } from "@/modules/users/schema.js";
import { validateEmail, validatePassword } from "@/modules/users/validators.js";
import settings from "@/settings.js";
import {
  ConflictError,
  UnauthenticatedError,
  ValidationError,
} from "@/shared/errors.js";

export async function signup(req: Request, res: Response) {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName)
    throw new ValidationError("Missing required fields.");
  validateEmail(email);
  validatePassword(password);

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

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ValidationError("Missing email or password.");
  validateEmail(email);
  validatePassword(password);

  const user = await getUserByEmail(email);
  if (!user) throw new UnauthenticatedError("Invalid email or password.");

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch)
    throw new UnauthenticatedError("Invalid email or password.");

  const token = jsonwebtoken.sign(
    { id: user.id, email: user.email },
    settings.jwt.secret,
    { expiresIn: "1h" }
  );
  res.json({ message: "Logged in successfully.", token: token });
}
