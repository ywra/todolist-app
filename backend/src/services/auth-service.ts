import * as userRepository from '../repositories/user-repository';
import { hashPassword, comparePassword } from '../utils/password-utils';
import { generateToken } from '../utils/jwt-utils';
import { AppError, ERROR_CODES } from '../utils/error-utils';
import { RegisterRequest, LoginRequest, AuthResponse, User } from '../types/auth-types';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function validateRegisterInput(data: RegisterRequest): void {
  const { email, password, name } = data;

  // name 검증: 1~50자, 공백만 불가
  if (!name || name.trim().length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '이름은 1자 이상 50자 이하이며, 공백만으로 구성될 수 없습니다.');
  }
  if (name.length > 50) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '이름은 1자 이상 50자 이하이며, 공백만으로 구성될 수 없습니다.');
  }

  // email 검증: RFC 5322 기본 형식, 최대 255자
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '이메일 형식이 올바르지 않습니다.');
  }
  if (email.length > 255) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '이메일은 최대 255자까지 입력 가능합니다.');
  }

  // password 검증: 8자 이상, 영문 1자+, 숫자 1자+, 특수문자 1자+
  if (!password || password.length < 8) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '비밀번호는 8자 이상이어야 합니다.');
  }
  if (!/[a-zA-Z]/.test(password)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '비밀번호는 영문자를 1자 이상 포함해야 합니다.');
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '비밀번호는 숫자를 1자 이상 포함해야 합니다.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/]/.test(password)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, '비밀번호는 특수문자를 1자 이상 포함해야 합니다.');
  }
}

export async function register(data: RegisterRequest): Promise<User> {
  validateRegisterInput(data);

  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new AppError(ERROR_CODES.DUPLICATE_EMAIL, '이미 사용 중인 이메일입니다.');
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await userRepository.createUser(data.email, hashedPassword, data.name);

  return user;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const INVALID_CREDENTIALS_MSG = '이메일 또는 비밀번호가 올바르지 않습니다';

  const userWithPassword = await userRepository.findByEmail(data.email);
  if (!userWithPassword) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, INVALID_CREDENTIALS_MSG);
  }

  const isMatch = await comparePassword(data.password, userWithPassword.password);
  if (!isMatch) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, INVALID_CREDENTIALS_MSG);
  }

  const token = generateToken({ userId: userWithPassword.id, email: userWithPassword.email });

  const user: User = {
    id: userWithPassword.id,
    email: userWithPassword.email,
    name: userWithPassword.name,
    createdAt: userWithPassword.createdAt,
  };

  return { token, user };
}
