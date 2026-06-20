CREATE TYPE "public"."exercise_category" AS ENUM('legs', 'chest', 'back', 'shoulders', 'arms', 'core', 'full-body', 'cardio');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "exercise_category" NOT NULL,
	"muscle_groups" text[] NOT NULL,
	CONSTRAINT "exercises_name_unique" UNIQUE("name")
);
