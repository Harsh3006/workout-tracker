import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";

import { JWT_SECRET } from "../../config/env.js";
import type { AuthPayload } from "../../modules/auth/types.js";
import { UnauthenticatedError } from "../errors.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    throw new UnauthenticatedError("Authorization header missing or invalid.");

  const token = authHeader.slice(7);
  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthenticatedError("Invalid or expired token.");
  }
};
