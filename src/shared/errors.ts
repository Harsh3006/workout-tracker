export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed.",
    public details?: Record<string, unknown>
  ) {
    super(message, 400);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Resource already exists or is in a conflicting state."
  ) {
    super(message, 409);
  }
}
