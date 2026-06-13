import type { Exercise } from "../models/exercise.js";
import { ExerciseCategory } from "../models/exercise.js";

export class ExerciseRepository {
  constructor(private readonly exercises: Exercise[]) {}

  async getAll(): Promise<Exercise[]> {
    return this.exercises;
  }

  async getById(id: string): Promise<Exercise | undefined> {
    return this.exercises.find((exercise) => exercise.id === id);
  }

  async getByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    return this.exercises.filter((exercise) => exercise.category === category);
  }
}
