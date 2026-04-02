import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt-utils';
import { AppError, ERROR_CODES } from '../utils/error-utils';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, '인증 토큰이 필요합니다.');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, '토큰 형식이 올바르지 않습니다. Bearer 토큰을 사용해주세요.');
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, '토큰이 제공되지 않았습니다.');
  }

  const payload = verifyToken(token);

  (req as any).user = {
    userId: payload.userId,
    email: payload.email,
  };

  next();
}
