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
}
