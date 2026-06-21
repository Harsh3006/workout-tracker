import type { Request, Response } from "express";

import { NotFoundError, ValidationError } from "../../shared/errors.js";
import { getExerciseById, getExercises } from "./queries.js";
import { isExerciseCategory } from "./validators.js";

export async function getAll(req: Request, res: Response) {
  const rawCategory = req.query.category;
  const category = isExerciseCategory(rawCategory) ? rawCategory : undefined;
  if (rawCategory && !category)
    throw new ValidationError("Invalid category.", {
      category: `${rawCategory} is not a valid exercise category.`,
    });

  const exercises = await getExercises({ category });
  res.json(exercises);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id))
    throw new ValidationError("Invalid exercise id.", {
      id: "Exercise id must be a number.",
    });
  const exercise = await getExerciseById(id);
  if (!exercise) throw new NotFoundError("Exercise not found.");
  res.json(exercise);
}
