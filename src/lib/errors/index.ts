export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, status = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError('INTERNAL_ERROR', error.message);
  return new AppError('INTERNAL_ERROR', 'An unexpected error occurred');
}

export function errorResponse(error: unknown) {
  const normalized = toAppError(error);
  return {
    success: false as const,
    error: normalized.message,
    code: normalized.code,
    ...(normalized.details ? { details: normalized.details } : {}),
  };
}

export function assertOrThrow(condition: unknown, code: ErrorCode, message: string, status = 400): asserts condition {
  if (!condition) throw new AppError(code, message, status);
}