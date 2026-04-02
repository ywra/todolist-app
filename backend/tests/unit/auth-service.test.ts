/**
 * BE-08: auth-service 단위 테스트
 */

// env.ts 검증 통과용
process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-unit-tests';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['CORS_ORIGIN'] = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

import { AppError } from '../../src/utils/error-utils';
import { User } from '../../src/types/auth-types';

// userRepository mock
jest.mock('../../src/repositories/user-repository');
import * as userRepository from '../../src/repositories/user-repository';

// auth-service는 mock 설정 이후에 import
import * as authService from '../../src/services/auth-service';

const mockFindByEmail = userRepository.findByEmail as jest.MockedFunction<typeof userRepository.findByEmail>;
const mockCreateUser = userRepository.createUser as jest.MockedFunction<typeof userRepository.createUser>;

const sampleUser: User = {
  id: 'user-uuid-1234',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: new Date('2026-04-01T09:00:00.000Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BE-08: auth-service', () => {
  // ----------------------------------------------------------------
  // register
  // ----------------------------------------------------------------
  describe('register', () => {
    it('유효한 입력으로 회원가입 성공 시 User를 반환해야 한다', async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue(sampleUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password1!',
        name: '홍길동',
      });

      expect(result).toEqual(sampleUser);
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    it('이메일 형식이 잘못되면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'invalid-email', password: 'Password1!', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('비밀번호가 8자 미만이면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'test@example.com', password: 'Pa1!', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('비밀번호에 영문이 없으면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'test@example.com', password: '12345678!', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('비밀번호에 숫자가 없으면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'test@example.com', password: 'Password!', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('비밀번호에 특수문자가 없으면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'test@example.com', password: 'Password1', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('이름이 공백만이면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.register({ email: 'test@example.com', password: 'Password1!', name: '   ' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('이메일이 중복되면 DUPLICATE_EMAIL(409)을 throw해야 한다', async () => {
      mockFindByEmail.mockResolvedValue({ ...sampleUser, password: 'hashed' });

      await expect(
        authService.register({ email: 'test@example.com', password: 'Password1!', name: '홍길동' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'DUPLICATE_EMAIL', statusCode: 409 }));
    });
  });

  // ----------------------------------------------------------------
  // login
  // ----------------------------------------------------------------
  describe('login', () => {
    it('올바른 자격증명으로 로그인 성공 시 token과 user를 반환해야 한다', async () => {
      // 실제 bcrypt hash 대신 password-utils를 mock한다
      const { hashPassword } = await import('../../src/utils/password-utils');
      const realHash = await hashPassword('Password1!');
      mockFindByEmail.mockResolvedValue({ ...sampleUser, password: realHash });

      const result = await authService.login({ email: 'test@example.com', password: 'Password1!' });

      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
      expect(result.user).toEqual(sampleUser);
    });

    it('존재하지 않는 이메일이면 UNAUTHORIZED를 throw해야 한다', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notexist@example.com', password: 'Password1!' }),
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        }),
      );
    });

    it('비밀번호가 틀리면 UNAUTHORIZED를 throw하며 메시지가 동일해야 한다', async () => {
      const { hashPassword } = await import('../../src/utils/password-utils');
      const realHash = await hashPassword('Password1!');
      mockFindByEmail.mockResolvedValue({ ...sampleUser, password: realHash });

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass1!' }),
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        }),
      );
    });
  });
});
