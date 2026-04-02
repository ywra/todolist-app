/**
 * BE-05: jwt-utils 단위 테스트
 */

// env.ts 검증 통과용 (import 전에 설정 필요)
process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-unit-tests';
process.env['JWT_EXPIRES_IN'] = '1h';

import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../src/utils/jwt-utils';
import { AppError } from '../../src/utils/error-utils';
import { JwtPayload } from '../../src/types/auth-types';

describe('BE-05: jwt-utils', () => {
  const samplePayload: JwtPayload = {
    userId: 'user-uuid-1234',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('JwtPayload로 JWT 토큰을 생성해야 한다', () => {
      const token = generateToken(samplePayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // JWT 형식: header.payload.signature
      expect(token.split('.').length).toBe(3);
    });

    it('생성된 토큰에 payload 정보가 포함되어야 한다', () => {
      const token = generateToken(samplePayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload & JwtPayload;

      expect(decoded.userId).toBe(samplePayload.userId);
      expect(decoded.email).toBe(samplePayload.email);
    });

    it('만료 시간(exp)이 설정되어야 한다', () => {
      const token = generateToken(samplePayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('유효한 토큰을 검증하면 payload를 반환해야 한다', () => {
      const token = generateToken(samplePayload);
      const result = verifyToken(token);

      expect(result.userId).toBe(samplePayload.userId);
      expect(result.email).toBe(samplePayload.email);
    });

    it('만료된 토큰 검증 시 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      // 즉시 만료되는 토큰 생성
      const expiredToken = jwt.sign(samplePayload, 'test-jwt-secret-key-for-unit-tests', {
        expiresIn: -1,
      });

      expect(() => verifyToken(expiredToken)).toThrow(AppError);
      expect(() => verifyToken(expiredToken)).toThrow(expect.objectContaining({
        errorCode: 'UNAUTHORIZED',
        statusCode: 401,
      }));
    });

    it('만료된 토큰의 에러 메시지는 만료 관련 내용이어야 한다', () => {
      const expiredToken = jwt.sign(samplePayload, 'test-jwt-secret-key-for-unit-tests', {
        expiresIn: -1,
      });

      let thrownError: AppError | null = null;
      try {
        verifyToken(expiredToken);
      } catch (err) {
        thrownError = err as AppError;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toContain('만료');
    });

    it('변조된(잘못된 시크릿으로 서명된) 토큰 검증 시 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      const tamperedToken = jwt.sign(samplePayload, 'wrong-secret-key');

      expect(() => verifyToken(tamperedToken)).toThrow(AppError);
      expect(() => verifyToken(tamperedToken)).toThrow(expect.objectContaining({
        errorCode: 'UNAUTHORIZED',
        statusCode: 401,
      }));
    });

    it('형식이 잘못된 문자열은 AppError(UNAUTHORIZED)를 throw해야 한다', () => {
      expect(() => verifyToken('not.a.valid.jwt.token')).toThrow(AppError);
      expect(() => verifyToken('completely-invalid')).toThrow(AppError);
      expect(() => verifyToken('')).toThrow(AppError);
    });

    it('변조된 토큰의 에러 메시지는 유효하지 않은 토큰 관련 내용이어야 한다', () => {
      const tamperedToken = jwt.sign(samplePayload, 'wrong-secret-key');

      let thrownError: AppError | null = null;
      try {
        verifyToken(tamperedToken);
      } catch (err) {
        thrownError = err as AppError;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toContain('유효하지 않은');
    });
  });
});
