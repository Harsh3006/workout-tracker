export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  performedAt: string;
  exercises: WorkoutExercise[];
  notes?: string;
}
