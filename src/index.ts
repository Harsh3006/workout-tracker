import express from "express";

import authRouter from "./modules/auth/routes.js";
import exerciseRouter from "./modules/exercises/routes.js";
import workoutsRouter from "./modules/workouts/routes.js";
import { authenticate } from "./shared/middleware/auth.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to Workout Tracker API");
});

app.use("/exercises", exerciseRouter);
app.use("/auth", authRouter);
app.use("/workouts", authenticate, workoutsRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
