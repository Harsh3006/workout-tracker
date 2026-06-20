import type { Request, Response } from "express";

import { getExerciseById, getExercises } from "./queries.js";
import { isExerciseCategory } from "./validators.js";

export function createExercisesController() {
  {
    async function getAll(req: Request, res: Response) {
      const rawCategory = req.query.category;
      const category = isExerciseCategory(rawCategory)
        ? rawCategory
        : undefined;
      if (rawCategory && !category) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }

      const exercises = await getExercises({ category });
      res.json(exercises);
    }

    async function getById(req: Request<{ id: string }>, res: Response) {
      const id = Number(req.params.id);
      const exercise = await getExerciseById(id);
      if (!exercise) {
        res.status(404).json({ message: "Exercise not found" });
        return;
      }
      res.json(exercise);
    }

    return { getAll, getById };
  }
}
