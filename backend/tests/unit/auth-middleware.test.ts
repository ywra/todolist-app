/**
 * BE-06: auth-middleware 단위 테스트
 */

// env.ts 검증 통과용 (import 전에 설정 필요)
process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-unit-tests';
process.env['JWT_EXPIRES_IN'] = '1h';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middlewares/auth-middleware';
import { generateToken } from '../../src/utils/jwt-utils';
import { AppError } from '../../src/utils/error-utils';
import { JwtPayload } from '../../src/types/auth-types';

// Express mock 헬퍼
function createMockReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function createMockRes(): Partial<Response> {
  return {};
}

function createMockNext(): jest.Mock<NextFunction> {
  return jest.fn() as unknown as jest.Mock<NextFunction>;
}

describe('BE-06: auth-middleware', () => {
  const samplePayload: JwtPayload = {
    userId: 'user-uuid-5678',
    email: 'auth@example.com',
  };

  describe('Authorization 헤더 검증', () => {
    it('Authorization 헤더가 없으면 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        }),
      );
    });

    it('Authorization 헤더가 없으면 next()를 호출하지 않아야 한다', () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (_) {
        // 예외 무시
      }

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Bearer 형식 검증', () => {
    it('"Bearer " 접두사가 없는 헤더는 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const req = createMockReq('Basic sometoken');
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        }),
      );
    });

    it('"bearer " 소문자 형식은 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const req = createMockReq('bearer sometoken');
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
    });

    it('"Bearer" 뒤에 공백 없이 토큰만 있는 경우 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const req = createMockReq('Bearertoken');
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
    });

    it('"Bearer " 형식이 아닌 헤더는 next()를 호출하지 않아야 한다', () => {
      const req = createMockReq('Token somevalue');
      const res = createMockRes();
      const next = createMockNext();

      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (_) {
        // 예외 무시
      }

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('만료된 토큰', () => {
    it('만료된 토큰은 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const expiredToken = jwt.sign(samplePayload, 'test-jwt-secret-key-for-unit-tests', {
        expiresIn: -1,
      });
      const req = createMockReq(`Bearer ${expiredToken}`);
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        }),
      );
    });

    it('만료된 토큰의 에러 메시지는 만료 관련 내용이어야 한다', () => {
      const expiredToken = jwt.sign(samplePayload, 'test-jwt-secret-key-for-unit-tests', {
        expiresIn: -1,
      });
      const req = createMockReq(`Bearer ${expiredToken}`);
      const res = createMockRes();
      const next = createMockNext();

      let thrownError: AppError | null = null;
      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (err) {
        thrownError = err as AppError;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toContain('만료');
    });

    it('만료된 토큰은 next()를 호출하지 않아야 한다', () => {
      const expiredToken = jwt.sign(samplePayload, 'test-jwt-secret-key-for-unit-tests', {
        expiresIn: -1,
      });
      const req = createMockReq(`Bearer ${expiredToken}`);
      const res = createMockRes();
      const next = createMockNext();

      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (_) {
        // 예외 무시
      }

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('변조된 토큰', () => {
    it('잘못된 시크릿으로 서명된 토큰은 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const tamperedToken = jwt.sign(samplePayload, 'wrong-secret-key');
      const req = createMockReq(`Bearer ${tamperedToken}`);
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        }),
      );
    });

    it('변조된 토큰의 에러 메시지는 유효하지 않은 토큰 관련 내용이어야 한다', () => {
      const tamperedToken = jwt.sign(samplePayload, 'wrong-secret-key');
      const req = createMockReq(`Bearer ${tamperedToken}`);
      const res = createMockRes();
      const next = createMockNext();

      let thrownError: AppError | null = null;
      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (err) {
        thrownError = err as AppError;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toContain('유효하지 않은');
    });

    it('완전히 잘못된 형식의 문자열은 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const req = createMockReq('Bearer not-a-valid-jwt');
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req as Request, res as Response, next as unknown as NextFunction)).toThrow(AppError);
    });

    it('변조된 토큰은 next()를 호출하지 않아야 한다', () => {
      const tamperedToken = jwt.sign(samplePayload, 'wrong-secret-key');
      const req = createMockReq(`Bearer ${tamperedToken}`);
      const res = createMockRes();
      const next = createMockNext();

      try {
        authMiddleware(req as Request, res as Response, next as unknown as NextFunction);
      } catch (_) {
        // 예외 무시
      }

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('유효한 토큰', () => {
    it('유효한 토큰이면 req.user에 { userId, email }을 설정해야 한다', () => {
      const token = generateToken(samplePayload);
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res as Response, next as unknown as NextFunction);

      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(samplePayload.userId);
      expect(req.user?.email).toBe(samplePayload.email);
    });

    it('유효한 토큰이면 next()를 정확히 1회 호출해야 한다', () => {
      const token = generateToken(samplePayload);
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res as Response, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('유효한 토큰이면 next()에 인자 없이 호출해야 한다 (에러 없음)', () => {
      const token = generateToken(samplePayload);
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res as Response, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith();
    });

    it('유효한 토큰이면 AppError를 throw하지 않아야 한다', () => {
      const token = generateToken(samplePayload);
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes();
      const next = createMockNext();

      expect(() => authMiddleware(req, res as Response, next as unknown as NextFunction)).not.toThrow();
    });
  });
});
