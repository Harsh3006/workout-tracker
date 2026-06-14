import express from "express";

import authRouter from "./routes/auth.routes.js";
import exerciseRouter from "./routes/exercise.routes.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to Workout Tracker API");
});

app.use("/exercises", exerciseRouter);
app.use("/auth", authRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
