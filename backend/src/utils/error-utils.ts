export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.statusCode = ERROR_STATUS_MAP[errorCode];

    // TypeScript에서 Error를 상속할 때 prototype chain이 끊기는 문제 방지
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
