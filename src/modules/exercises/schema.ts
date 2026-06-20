import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "legs",
  "chest",
  "back",
  "shoulders",
  "arms",
  "core",
  "full-body",
  "cardio",
]);

export const exercises = pgTable("exercises", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: exerciseCategoryEnum("category").notNull(),
  muscleGroups: text("muscle_groups").array().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type ExerciseCategory =
  (typeof exerciseCategoryEnum)["enumValues"][number];
