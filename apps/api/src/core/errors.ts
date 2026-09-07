export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string = 'UNAUTHORIZED', message: string = 'Unauthorized') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string = 'FORBIDDEN', message: string = 'Forbidden') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string = 'NOT_FOUND', message: string = 'Not found') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(code: string = 'CONFLICT', message: string = 'Conflict') {
    super(409, code, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(code: string = 'RATE_LIMITED', message: string = 'Too many requests') {
    super(429, code, message);
  }
}

export class InternalServerError extends AppError {
  constructor(code: string = 'INTERNAL_ERROR', message: string = 'Internal server error') {
    super(500, code, message);
  }
}
