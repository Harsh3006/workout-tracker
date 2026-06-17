import type { Request, Response } from "express";

import type { ExerciseRepository } from "./repository.js";
import { isExerciseCategory } from "./validators.js";

export function createExercisesController(
  exerciseRepository: ExerciseRepository
) {
  {
    async function getAll(req: Request, res: Response) {
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
    }

    async function getById(req: Request<{ id: string }>, res: Response) {
      const { id } = req.params;
      const exercise = await exerciseRepository.getById(id);
      if (!exercise) {
        res.status(404).json({ message: "Exercise not found" });
        return;
      }
      res.json(exercise);
    }

    return { getAll, getById };
  }
}
