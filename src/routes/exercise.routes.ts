import { Router } from "express";

import exercises from "../data/exercises.json" with { type: "json" };
import type { Exercise } from "../models/exercise.js";
import { ExerciseRepository } from "../repositories/exercise.repository.js";
import { isExerciseCategory } from "../validators/exercise.validator.js";

const exerciseRepository = new ExerciseRepository(exercises as Exercise[]);

const exerciseRouter = Router();

exerciseRouter.get("/", async (req, res) => {
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

exerciseRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const exercise = await exerciseRepository.getById(id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }
  res.json(exercise);
});

export default exerciseRouter;
