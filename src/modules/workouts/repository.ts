import { writeFile } from "fs/promises";

import type { Workout } from "./models.js";

export class WorkoutRepository {
  constructor(private readonly workouts: Workout[]) {}

  async getByUserId(userId: string): Promise<Workout[]> {
    return this.workouts.filter((workout) => workout.userId === userId);
  }

  async getById(
    workoutId: string,
    userId: string
  ): Promise<Workout | undefined> {
    const workout = this.workouts.find(
      (w) => w.id === workoutId && w.userId === userId
    );
    return workout;
  }

  async delete(workoutId: string, userId: string): Promise<void> {
    const index = this.workouts.findIndex(
      (w) => w.id === workoutId && w.userId === userId
    );
    if (index !== -1) {
      this.workouts.splice(index, 1);
      await writeFile(
        "src/data/workouts.json",
        JSON.stringify(this.workouts, null, 2)
      );
    } else {
      throw new Error("Workout not found or unauthorized");
    }
  }
}
