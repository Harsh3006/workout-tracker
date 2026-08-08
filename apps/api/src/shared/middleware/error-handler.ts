import type { ErrorRequestHandler } from "express";

import { AppError, ValidationError } from "@/shared/errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    return res
      .status(err.statusCode)
      .json({ message: err.message, details: err.details });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ message: "Internal Server Error" });
};
