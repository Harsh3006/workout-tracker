import { sql } from "drizzle-orm";
import {
  check,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { exercises } from "../exercises/schema.js";
import { users } from "../users/schema.js";

export const workouts = pgTable("workouts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  performedAt: timestamp("performed_at", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("workout_exercises_order_unique").on(
      table.workoutId,
      table.orderIndex
    ),
    check("order_index_non_negative", sql`${table.orderIndex} >= 0`),
  ]
);

export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    reps: integer("reps").notNull(),
    weight: numeric("weight", {
      precision: 6,
      scale: 2,
      mode: "number",
    }).notNull(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("exercise_sets_order_unique").on(
      table.workoutExerciseId,
      table.orderIndex
    ),
    check("reps_positive", sql`${table.reps} > 0`),
    check("weight_non_negative", sql`${table.weight} >= 0`),
    check("order_index_non_negative", sql`${table.orderIndex} >= 0`),
  ]
);

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type NewExerciseSet = typeof exerciseSets.$inferInsert;
