import { ValidationError } from "@/shared/errors.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): asserts email is string {
  if (typeof email !== "string" || !emailRegex.test(email))
    throw new ValidationError("Invalid email address.");
}

export function validatePassword(
  password: unknown
): asserts password is string {
  if (typeof password !== "string" || password.length < 8)
    throw new ValidationError("Password must be at least 8 characters long.");
}
