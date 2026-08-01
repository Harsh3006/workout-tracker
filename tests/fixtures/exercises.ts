import { db } from "@/db.js";
import type { NewExercise } from "@/modules/exercises/schema.js";
import { exercises } from "@/modules/exercises/schema.js";

export const exercisesFixture: NewExercise[] = [
  {
    name: "Squat",
    description: "Compound lower-body movement targeting the legs and glutes.",
    category: "legs",
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
  },
  {
    name: "Bench Press",
    description: "Barbell chest press.",
    category: "chest",
    muscleGroups: ["chest", "front-deltoids", "triceps"],
  },
  {
    name: "Lat Pulldown",
    description: "Machine-based vertical pulling exercise.",
    category: "back",
    muscleGroups: ["lats", "biceps"],
  },
];

export async function seedExercises() {
  const inserted = await db
    .insert(exercises)
    .values(exercisesFixture)
    .returning();

  const [squat, benchPress, latPulldown] = inserted;
  return {
    exercises: inserted,
    squat: squat!,
    benchPress: benchPress!,
    latPulldown: latPulldown!,
  };
}
