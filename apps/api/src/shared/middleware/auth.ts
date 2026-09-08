import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";

import type { AuthPayload } from "@/modules/auth/types.js";
import settings from "@/settings.js";
import { UnauthenticatedError } from "@/shared/errors.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.cookies.accessToken;
  if (!token) throw new UnauthenticatedError("Authentication required.");

  try {
    const decoded = jsonwebtoken.verify(
      token,
      settings.jwtSecret
    ) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthenticatedError("Invalid or expired token.");
  }
};
