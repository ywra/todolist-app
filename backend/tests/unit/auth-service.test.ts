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
const mockFindById = userRepository.findById as jest.MockedFunction<typeof userRepository.findById>;
const mockUpdateUser = userRepository.updateUser as jest.MockedFunction<typeof userRepository.updateUser>;
const mockFindByIdWithPassword = userRepository.findByIdWithPassword as jest.MockedFunction<typeof userRepository.findByIdWithPassword>;
const mockUpdatePassword = userRepository.updatePassword as jest.MockedFunction<typeof userRepository.updatePassword>;

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

  // ----------------------------------------------------------------
  // getProfile
  // ----------------------------------------------------------------
  describe('getProfile', () => {
    it('존재하는 userId로 호출 시 User를 반환해야 한다', async () => {
      mockFindById.mockResolvedValue(sampleUser);

      const result = await authService.getProfile('user-uuid-1234');

      expect(result).toEqual(sampleUser);
      expect(mockFindById).toHaveBeenCalledWith('user-uuid-1234');
    });

    it('존재하지 않는 userId이면 NOT_FOUND(404)를 throw해야 한다', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(
        expect.objectContaining({ errorCode: 'NOT_FOUND', statusCode: 404 }),
      );
    });
  });

  // ----------------------------------------------------------------
  // updateProfile
  // ----------------------------------------------------------------
  describe('updateProfile', () => {
    it('유효한 name으로 호출 시 업데이트된 User를 반환해야 한다', async () => {
      const updatedUser = { ...sampleUser, name: '새이름' };
      mockUpdateUser.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile('user-uuid-1234', { name: '새이름' });

      expect(result).toEqual(updatedUser);
      expect(mockUpdateUser).toHaveBeenCalledWith('user-uuid-1234', '새이름');
    });

    it('name이 공백만이면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.updateProfile('user-uuid-1234', { name: '   ' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('name이 50자를 초과하면 VALIDATION_ERROR를 throw해야 한다', async () => {
      const longName = 'a'.repeat(51);
      await expect(
        authService.updateProfile('user-uuid-1234', { name: longName }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('name이 빈 문자열이면 VALIDATION_ERROR를 throw해야 한다', async () => {
      await expect(
        authService.updateProfile('user-uuid-1234', { name: '' }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });
  });

  // ----------------------------------------------------------------
  // changePassword
  // ----------------------------------------------------------------
  describe('changePassword', () => {
    it('올바른 현재 비밀번호와 유효한 새 비밀번호로 변경 성공 시 void를 반환해야 한다', async () => {
      const { hashPassword } = await import('../../src/utils/password-utils');
      const currentHash = await hashPassword('OldPass1!');
      mockFindByIdWithPassword.mockResolvedValue({ ...sampleUser, password: currentHash });
      mockUpdatePassword.mockResolvedValue(undefined);

      await expect(
        authService.changePassword('user-uuid-1234', {
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass2@',
        }),
      ).resolves.toBeUndefined();

      expect(mockUpdatePassword).toHaveBeenCalledTimes(1);
    });

    it('사용자가 존재하지 않으면 NOT_FOUND(404)를 throw해야 한다', async () => {
      mockFindByIdWithPassword.mockResolvedValue(null);

      await expect(
        authService.changePassword('nonexistent', {
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass2@',
        }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'NOT_FOUND', statusCode: 404 }));
    });

    it('현재 비밀번호가 틀리면 UNAUTHORIZED(401)를 throw해야 한다', async () => {
      const { hashPassword } = await import('../../src/utils/password-utils');
      const currentHash = await hashPassword('OldPass1!');
      mockFindByIdWithPassword.mockResolvedValue({ ...sampleUser, password: currentHash });

      await expect(
        authService.changePassword('user-uuid-1234', {
          currentPassword: 'WrongOld1!',
          newPassword: 'NewPass2@',
        }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'UNAUTHORIZED', statusCode: 401 }));
    });

    it('새 비밀번호가 8자 미만이면 VALIDATION_ERROR를 throw해야 한다', async () => {
      const { hashPassword } = await import('../../src/utils/password-utils');
      const currentHash = await hashPassword('OldPass1!');
      mockFindByIdWithPassword.mockResolvedValue({ ...sampleUser, password: currentHash });

      await expect(
        authService.changePassword('user-uuid-1234', {
          currentPassword: 'OldPass1!',
          newPassword: 'Sh1!',
        }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });

    it('새 비밀번호에 특수문자가 없으면 VALIDATION_ERROR를 throw해야 한다', async () => {
      const { hashPassword } = await import('../../src/utils/password-utils');
      const currentHash = await hashPassword('OldPass1!');
      mockFindByIdWithPassword.mockResolvedValue({ ...sampleUser, password: currentHash });

      await expect(
        authService.changePassword('user-uuid-1234', {
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass22',
        }),
      ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR', statusCode: 400 }));
    });
  });
});
