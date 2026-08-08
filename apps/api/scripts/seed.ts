import { notInArray, sql } from "drizzle-orm";

import { db } from "@/db.js";
import type { NewExercise } from "@/modules/exercises/schema.js";
import { exercises as exercisesTable } from "@/modules/exercises/schema.js";

import exercises from "../data/exercises.json" with { type: "json" };

await db.transaction(async (tx) => {
  // Upsert all exercises from JSON
  await tx
    .insert(exercisesTable)
    .values(exercises as NewExercise[])
    .onConflictDoUpdate({
      target: exercisesTable.name,
      set: {
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        muscleGroups: sql`excluded.muscle_groups`,
      },
    });

  // Delete rows not present in JSON
  const exerciseNames = exercises.map((e) => e.name);
  await tx
    .delete(exercisesTable)
    .where(notInArray(exercisesTable.name, exerciseNames));
});

console.log("Exercises synchronized successfully!");
process.exit(0);
