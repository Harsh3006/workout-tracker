import express from "express";
import exercises from "./data/exercises.json" with { type: "json" };

import { ExerciseRepository } from "./repositories/exercise.repository.js";
import { isExerciseCategory } from "./validators/exercise.validator.js";
import type { Exercise } from "./models/exercise.js";

const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);

const app = express();

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
