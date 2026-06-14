import bcrypt from "bcrypt";
import Router from "express";
import jsonwebtoken from "jsonwebtoken";

import { JWT_SECRET } from "../../config/env.js";
import users from "../../data/users.json" with { type: "json" };
import type { User } from "../users/models.js";
import { UserRepository } from "../users/repository.js";
import { isValidEmail, isValidPassword } from "../users/validators.js";

const userRepository = new UserRepository(users as User[]);

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: "Password must be at least 8 characters" });
    return;
  }

  const existingUser = await userRepository.getByEmail(email);
  if (existingUser) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    firstName,
    lastName,
  };
  await userRepository.create(newUser);
  res.status(201).json({ message: "User created" });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Missing email or password" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: "Invalid password format" });
    return;
  }

  const user = await userRepository.getByEmail(email);
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = jsonwebtoken.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ message: "Login successful", token: token });
});

export default authRouter;
