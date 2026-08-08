export type ExerciseSetData = {
  reps: number;
  weight: number;
};

export type WorkoutExerciseData = {
  exerciseId: number;
  sets: ExerciseSetData[];
};

export type CreateWorkoutData = {
  name: string;
  performedAt: Date;
  notes?: string;
  exercises: WorkoutExerciseData[];
};

export type UpdateWorkoutData = Partial<CreateWorkoutData>;
