/**
 * BE-09: Auth API 통합 테스트
 *
 * 실제 DB를 사용하는 통합 테스트.
 * 테스트 실행 전 환경 변수가 .env 또는 CI 환경에서 주입되어야 한다.
 */

process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-jwt-secret-integration';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['CORS_ORIGIN'] = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/config/db';

const TEST_EMAIL = `auth_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password1!';
const TEST_NAME = '테스트유저';

afterAll(async () => {
  // 테스트에서 생성된 계정 정리
  try {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['auth_test_%@example.com']);
  } catch (_) {
    // 정리 실패 무시
  }
  await pool.end();
});

describe('BE-09: Auth API 통합 테스트', () => {
  // ----------------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------------
  describe('POST /api/auth/register', () => {
    it('유효한 입력으로 회원가입 성공 시 201과 user를 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        email: TEST_EMAIL,
        name: TEST_NAME,
      });
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('createdAt');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('중복 이메일 회원가입 시 409 DUPLICATE_EMAIL을 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('이메일 형식 오류 시 400 VALIDATION_ERROR를 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: TEST_PASSWORD,
        name: TEST_NAME,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('비밀번호 정책 위반 시 400 VALIDATION_ERROR를 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: `new_${Date.now()}@example.com`,
        password: 'weakpw',
        name: TEST_NAME,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ----------------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------------
  describe('POST /api/auth/login', () => {
    it('올바른 자격증명으로 로그인 시 200과 token을 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.user).toMatchObject({ email: TEST_EMAIL });
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('존재하지 않는 이메일로 로그인 시 401을 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'notexist@example.com',
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('잘못된 비밀번호로 로그인 시 401을 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: TEST_EMAIL,
        password: 'WrongPassword1!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ----------------------------------------------------------------
  // POST /api/auth/logout
  // ----------------------------------------------------------------
  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeAll(async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      token = loginRes.body.data.token as string;
    });

    it('유효한 토큰으로 로그아웃 시 200을 반환해야 한다', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('로그아웃 성공');
    });

    it('토큰 없이 로그아웃 시 401을 반환해야 한다', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
