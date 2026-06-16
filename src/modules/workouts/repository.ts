import type { Workout } from "./models.js";

export class WorkoutRepository {
  constructor(private readonly workouts: Workout[]) {}

  async getByUserId(userId: string): Promise<Workout[]> {
    return this.workouts.filter((workout) => workout.userId === userId);
  }
}
