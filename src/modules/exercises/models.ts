export enum ExerciseCategory {
  LEGS = "legs",
  CHEST = "chest",
  BACK = "back",
  SHOULDERS = "shoulders",
  ARMS = "arms",
  CORE = "core",
  FULL_BODY = "full-body",
  CARDIO = "cardio",
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[];
}
