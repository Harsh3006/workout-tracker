import express from "express";
import bcrypt from "bcrypt";
import exercises from "./data/exercises.json" with { type: "json" };
import users from "./data/users.json" with { type: "json" };

import { ExerciseRepository } from "./repositories/exercise.repository.js";
import { isExerciseCategory } from "./validators/exercise.validator.js";
import type { Exercise } from "./models/exercise.js";
import { UserRepository } from "./repositories/user.repository.js";
import {
  isValidEmail,
  isValidPassword,
} from "./validators/users.validators.js";
import type { User } from "./models/users.js";

const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);
const userRepository = new UserRepository(users as User[]);

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to Workout Tracker API");
});

app.get("/exercises", async (req, res) => {
  const { category } = req.query;
  if (!category) {
    const exercises = await exerciseRepository.getAll();
    res.json(exercises);
    return;
  }

  if (typeof category !== "string" || !isExerciseCategory(category)) {
    res.status(400).json({ message: "Invalid category" });
    return;
  }

  const exercises = await exerciseRepository.getByCategory(category);
  res.json(exercises);
});

app.get("/exercises/:id", async (req, res) => {
  const { id } = req.params;
  const exercise = await exerciseRepository.getById(id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }
  res.json(exercise);
});

app.post("/auth/signup", async (req, res) => {
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
