/**
 * 오늘의 할일 API 통합 테스트
 *
 * daily_todos 테이블을 사용하는 독립 시스템 테스트.
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

const TS = Date.now();
const USER_A = {
  email: `daily_a_${TS}@example.com`,
  password: 'Password1!',
  name: '사용자A',
};
const USER_B = {
  email: `daily_b_${TS}@example.com`,
  password: 'Password1!',
  name: '사용자B',
};

let tokenA: string;
let tokenB: string;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send(USER_A);
  const loginA = await request(app).post('/api/auth/login').send({
    email: USER_A.email,
    password: USER_A.password,
  });
  tokenA = loginA.body.data.token as string;

  await request(app).post('/api/auth/register').send(USER_B);
  const loginB = await request(app).post('/api/auth/login').send({
    email: USER_B.email,
    password: USER_B.password,
  });
  tokenB = loginB.body.data.token as string;
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email LIKE $1', [`daily_%_${TS}@example.com`]);
  } catch (_) {
    // 정리 실패 무시
  }
  await pool.end();
});

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function makeDailyTodoBody(overrides: Record<string, unknown> = {}) {
  return {
    title: '오늘의 할일 제목',
    startDate: '2026-01-01',
    dueDate: '2099-12-31',
    ...overrides,
  };
}

// ----------------------------------------------------------------
// POST /api/daily-todos
// ----------------------------------------------------------------
describe('POST /api/daily-todos - 생성', () => {
  it('유효한 입력으로 생성 시 201을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ title: '새 오늘의 할일', description: '설명입니다' }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: '새 오늘의 할일',
      description: '설명입니다',
      isCompleted: false,
    });
    expect(res.body.data).toHaveProperty('id');
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app).post('/api/daily-todos').send(makeDailyTodoBody());
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('제목이 공백이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ title: '   ' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('제목이 200자 초과이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ title: 'a'.repeat(201) }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('설명이 2000자 초과이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ description: 'a'.repeat(2001) }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('날짜 형식이 잘못되면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ startDate: '20260101' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('dueDate가 startDate보다 이전이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send(makeDailyTodoBody({ startDate: '2026-04-10', dueDate: '2026-04-01' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ----------------------------------------------------------------
// GET /api/daily-todos - 목록 조회
// ----------------------------------------------------------------
describe('GET /api/daily-todos - 목록 조회', () => {
  const TODAY = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    // 오늘 포함 범위
    await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send({ title: '오늘 포함 A', startDate: '2026-01-01', dueDate: '2099-12-31' });

    // 오늘 하루
    await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send({ title: '오늘 하루 B', startDate: TODAY, dueDate: TODAY });

    // 미래 시작 (오늘 범위 밖)
    await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send({ title: '미래 할일', startDate: '2099-01-01', dueDate: '2099-12-31' });

    // 이미 종료 (오늘 범위 밖)
    await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send({ title: '종료된 할일', startDate: '2020-01-01', dueDate: '2020-01-02' });
  });

  it('오늘 날짜 범위에 해당하는 오늘의 할일만 반환해야 한다', async () => {
    const res = await request(app)
      .get('/api/daily-todos')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const titles = res.body.data.map((t: { title: string }) => t.title) as string[];
    expect(titles).toContain('오늘 포함 A');
    expect(titles).toContain('오늘 하루 B');
    expect(titles).not.toContain('미래 할일');
    expect(titles).not.toContain('종료된 할일');
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app).get('/api/daily-todos');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('오늘 범위 할일이 없는 신규 사용자는 빈 배열을 반환해야 한다', async () => {
    const emptyUser = {
      email: `daily_empty_${TS}@example.com`,
      password: 'Password1!',
      name: '빈사용자',
    };
    await request(app).post('/api/auth/register').send(emptyUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: emptyUser.email,
      password: emptyUser.password,
    });
    const emptyToken = loginRes.body.data.token as string;

    const res = await request(app)
      .get('/api/daily-todos')
      .set(authHeader(emptyToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

// ----------------------------------------------------------------
// 완료/미완료 + 삭제 흐름
// ----------------------------------------------------------------
describe('완료/미완료/삭제 흐름', () => {
  let todoId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenA))
      .send({ title: '흐름 테스트', startDate: '2026-01-01', dueDate: '2099-12-31' });
    todoId = res.body.data.id as string;
  });

  it('완료 처리 시 isCompleted가 true가 되어야 한다', async () => {
    const res = await request(app)
      .patch(`/api/daily-todos/${todoId}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCompleted).toBe(true);
  });

  it('미완료 처리 시 isCompleted가 false가 되어야 한다', async () => {
    const res = await request(app)
      .patch(`/api/daily-todos/${todoId}/incomplete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCompleted).toBe(false);
  });

  it('삭제 시 204 No Content를 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/daily-todos/${todoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(204);
  });
});

// ----------------------------------------------------------------
// 권한 검증
// ----------------------------------------------------------------
describe('권한 검증', () => {
  let userBTodoId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/daily-todos')
      .set(authHeader(tokenB))
      .send({ title: '사용자B의 오늘의 할일', startDate: '2026-01-01', dueDate: '2099-12-31' });
    userBTodoId = res.body.data.id as string;
  });

  it('다른 사용자 오늘의 할일 완료 처리 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .patch(`/api/daily-todos/${userBTodoId}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('다른 사용자 오늘의 할일 삭제 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/daily-todos/${userBTodoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ----------------------------------------------------------------
// 존재하지 않는 오늘의 할일
// ----------------------------------------------------------------
describe('존재하지 않는 오늘의 할일', () => {
  const NONEXISTENT = '00000000-0000-0000-0000-000000000000';

  it('PATCH /:id/complete - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .patch(`/api/daily-todos/${NONEXISTENT}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /:id - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/daily-todos/${NONEXISTENT}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
