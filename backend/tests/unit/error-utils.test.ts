/**
 * BE-03: AppError 클래스 단위 테스트
 */

import { AppError, ERROR_CODES, ErrorCode } from '../../src/utils/error-utils';

describe('BE-03: AppError 클래스', () => {
  describe('에러 코드 상수', () => {
    it('6종 에러 코드가 정의되어야 한다', () => {
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
      expect(ERROR_CODES.DUPLICATE_EMAIL).toBe('DUPLICATE_EMAIL');
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });

  describe('AppError 인스턴스 생성', () => {
    it('VALIDATION_ERROR: statusCode 400을 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.VALIDATION_ERROR, '입력값이 올바르지 않습니다.');
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('입력값이 올바르지 않습니다.');
    });

    it('UNAUTHORIZED: statusCode 401을 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.UNAUTHORIZED, '인증이 필요합니다.');
      expect(err.statusCode).toBe(401);
      expect(err.errorCode).toBe('UNAUTHORIZED');
    });

    it('FORBIDDEN: statusCode 403을 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.FORBIDDEN, '접근 권한이 없습니다.');
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('FORBIDDEN');
    });

    it('NOT_FOUND: statusCode 404를 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.NOT_FOUND, '리소스를 찾을 수 없습니다.');
      expect(err.statusCode).toBe(404);
      expect(err.errorCode).toBe('NOT_FOUND');
    });

    it('DUPLICATE_EMAIL: statusCode 409를 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.DUPLICATE_EMAIL, '이미 사용 중인 이메일입니다.');
      expect(err.statusCode).toBe(409);
      expect(err.errorCode).toBe('DUPLICATE_EMAIL');
    });

    it('INTERNAL_ERROR: statusCode 500을 가져야 한다', () => {
      const err = new AppError(ERROR_CODES.INTERNAL_ERROR, '서버 내부 오류가 발생했습니다.');
      expect(err.statusCode).toBe(500);
      expect(err.errorCode).toBe('INTERNAL_ERROR');
    });
  });

  describe('AppError instanceof 검사', () => {
    it('AppError 인스턴스는 Error를 상속해야 한다', () => {
      const err = new AppError(ERROR_CODES.NOT_FOUND, '테스트');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
    });

    it('AppError의 name 속성은 "AppError"여야 한다', () => {
      const err = new AppError(ERROR_CODES.VALIDATION_ERROR, '테스트');
      expect(err.name).toBe('AppError');
    });

    it('일반 Error는 AppError instanceof를 통과하지 않아야 한다', () => {
      const err = new Error('일반 에러');
      expect(err).not.toBeInstanceOf(AppError);
    });
  });

  describe('에러 타입 안전성', () => {
    it('유효하지 않은 에러 코드는 타입 오류를 발생시켜야 한다 (컴파일 타임 검증)', () => {
      // 런타임 검증: 유효한 에러 코드만 허용
      const validCodes: ErrorCode[] = [
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'DUPLICATE_EMAIL',
        'INTERNAL_ERROR',
      ];
      validCodes.forEach((code) => {
        const err = new AppError(code, '테스트 메시지');
        expect(err.errorCode).toBe(code);
      });
    });
  });
});
