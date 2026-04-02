import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types/auth-types';
import { AppError, ERROR_CODES } from './error-utils';

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, '토큰이 만료되었습니다.');
    }
    throw new AppError(ERROR_CODES.UNAUTHORIZED, '유효하지 않은 토큰입니다.');
  }
}
