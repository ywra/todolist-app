/**
 * BE-12: Todo API 통합 테스트
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

// ----------------------------------------------------------------
// 테스트 사용자 설정
// ----------------------------------------------------------------
const TS = Date.now();
const USER_A = {
  email: `todo_a_${TS}@example.com`,
  password: 'Password1!',
  name: '사용자A',
};
const USER_B = {
  email: `todo_b_${TS}@example.com`,
  password: 'Password1!',
  name: '사용자B',
};

let tokenA: string;
let tokenB: string;

beforeAll(async () => {
  // 사용자 A 등록 + 로그인
  await request(app).post('/api/auth/register').send(USER_A);
  const loginA = await request(app).post('/api/auth/login').send({
    email: USER_A.email,
    password: USER_A.password,
  });
  tokenA = loginA.body.data.token as string;

  // 사용자 B 등록 + 로그인
  await request(app).post('/api/auth/register').send(USER_B);
  const loginB = await request(app).post('/api/auth/login').send({
    email: USER_B.email,
    password: USER_B.password,
  });
  tokenB = loginB.body.data.token as string;
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email LIKE $1', [`todo_%_${TS}@example.com`]);
  } catch (_) {
    // 정리 실패 무시
  }
  await pool.end();
});

// ----------------------------------------------------------------
// 헬퍼
// ----------------------------------------------------------------
function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function makeTodoBody(overrides: Record<string, unknown> = {}) {
  return {
    title: '기본 할일 제목',
    startDate: '2026-04-01',
    dueDate: '2026-04-30',
    ...overrides,
  };
}

// ----------------------------------------------------------------
// POST /api/todos
// ----------------------------------------------------------------
describe('POST /api/todos', () => {
  it('유효한 입력으로 할일 등록 시 201을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ title: '새 할일', description: '설명입니다' }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: '새 할일',
      description: '설명입니다',
      isCompleted: false,
    });
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('id');
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app).post('/api/todos').send(makeTodoBody());
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('제목이 공백이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ title: '   ' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('제목이 200자 초과이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ title: 'a'.repeat(201) }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('설명이 2000자 초과이면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ description: 'a'.repeat(2001) }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('날짜 형식이 잘못되면 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ startDate: '20260401' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('dueDate가 startDate보다 이전이면 400 VALIDATION_ERROR를 반환해야 한다 (BR-04)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ startDate: '2026-04-10', dueDate: '2026-04-01' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ----------------------------------------------------------------
// 전체 CRUD 흐름 + 필터/정렬/페이지네이션
// ----------------------------------------------------------------
describe('Todo CRUD 전체 흐름', () => {
  let todoId: string;

  it('Step 1: 할일 등록', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send(makeTodoBody({ title: 'CRUD 흐름 테스트' }));

    expect(res.status).toBe(201);
    todoId = res.body.data.id as string;
    expect(todoId).toBeTruthy();
  });

  it('Step 2: 목록 조회 - 등록된 할일이 포함되어야 한다', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toMatchObject({
      page: expect.any(Number),
      size: expect.any(Number),
      totalCount: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('Step 3: 상세 조회 - 정확한 데이터를 반환해야 한다', async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(todoId);
    expect(res.body.data).toHaveProperty('status');
  });

  it('Step 4: 수정 - 제목이 업데이트되어야 한다', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set(authHeader(tokenA))
      .send({ title: '수정된 제목', startDate: '2026-04-01', dueDate: '2026-04-30' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('수정된 제목');
  });

  it('Step 5: 완료 처리 - status가 COMPLETED가 되어야 한다', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  it('Step 6: 완료 취소 - isCompleted가 false로 돌아와야 한다', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/incomplete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.isCompleted).toBe(false);
    expect(res.body.data.status).not.toBe('completed');
  });

  it('Step 7: 삭제 - 204 No Content를 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(204);
  });

  it('삭제 후 상세 조회 시 404를 반환해야 한다', async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ----------------------------------------------------------------
// GET /api/todos - 필터/정렬/페이지네이션
// ----------------------------------------------------------------
describe('GET /api/todos - 필터/정렬/페이지네이션', () => {
  beforeAll(async () => {
    // 필터 테스트를 위해 여러 할일 생성
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '과거 할일', startDate: '2020-01-01', dueDate: '2020-01-02' });
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '진행중 할일', startDate: '2020-01-01', dueDate: '2099-12-31' });
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '미래 할일', startDate: '2099-01-01', dueDate: '2099-12-31' });
  });

  it('status=overdue 필터가 동작해야 한다', async () => {
    const res = await request(app)
      .get('/api/todos?status=overdue')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { status: string }) => t.status === 'overdue')).toBe(true);
  });

  it('status=pending 필터가 동작해야 한다', async () => {
    const res = await request(app)
      .get('/api/todos?status=pending')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { status: string }) => t.status === 'pending')).toBe(true);
  });

  it('size=1 페이지네이션이 동작해야 한다', async () => {
    const res = await request(app)
      .get('/api/todos?size=1&page=1')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.pagination.size).toBe(1);
  });

  it('size=200 요청 시 최대 100으로 클램핑되어야 한다', async () => {
    const res = await request(app)
      .get('/api/todos?size=200')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.pagination.size).toBe(100);
  });

  it('sortBy=dueDate&sortOrder=asc 정렬이 동작해야 한다', async () => {
    const res = await request(app)
      .get('/api/todos?sortBy=dueDate&sortOrder=asc')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    const dates = res.body.data.map((t: { dueDate: string }) => t.dueDate) as string[];
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]! >= dates[i - 1]!).toBe(true);
    }
  });
});

// ----------------------------------------------------------------
// 권한 검증
// ----------------------------------------------------------------
describe('권한 검증 (BR-02)', () => {
  let userBTodoId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(tokenB))
      .send(makeTodoBody({ title: '사용자B의 할일' }));
    userBTodoId = res.body.data.id as string;
  });

  it('다른 사용자 할일 상세 조회 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .get(`/api/todos/${userBTodoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('다른 사용자 할일 수정 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .put(`/api/todos/${userBTodoId}`)
      .set(authHeader(tokenA))
      .send({ title: '탈취 시도', startDate: '2026-04-01', dueDate: '2026-04-30' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('다른 사용자 할일 완료 처리 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .patch(`/api/todos/${userBTodoId}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('다른 사용자 할일 삭제 시 403을 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/todos/${userBTodoId}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ----------------------------------------------------------------
// GET /api/todos/daily
// ----------------------------------------------------------------
describe('GET /api/todos/daily', () => {
  const TODAY = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    // 오늘 포함 범위 (in_progress)
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '오늘의 할일 A', startDate: '2026-01-01', dueDate: '2099-12-31' });

    // 오늘 시작, 오늘 마감
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '오늘의 할일 B', startDate: TODAY, dueDate: TODAY });

    // 오늘 범위 밖 - 미래 시작
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '미래 할일', startDate: '2099-01-01', dueDate: '2099-12-31' });

    // 오늘 범위 밖 - 이미 종료
    await request(app)
      .post('/api/todos')
      .set(authHeader(tokenA))
      .send({ title: '종료된 할일', startDate: '2020-01-01', dueDate: '2020-01-02' });
  });

  it('인증 후 오늘 날짜 범위에 해당하는 할일만 반환해야 한다', async () => {
    const res = await request(app)
      .get('/api/todos/daily')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const titles = res.body.data.map((t: { title: string }) => t.title) as string[];
    expect(titles).toContain('오늘의 할일 A');
    expect(titles).toContain('오늘의 할일 B');
    expect(titles).not.toContain('미래 할일');
    expect(titles).not.toContain('종료된 할일');
  });

  it('미인증 시 401을 반환해야 한다', async () => {
    const res = await request(app).get('/api/todos/daily');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('오늘 날짜 범위에 해당하는 할일이 없는 사용자는 빈 배열을 반환해야 한다', async () => {
    // 오늘 범위 할일이 없는 신규 사용자를 생성하여 테스트
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
      .get('/api/todos/daily')
      .set(authHeader(emptyToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

// ----------------------------------------------------------------
// 존재하지 않는 할일
// ----------------------------------------------------------------
describe('존재하지 않는 할일', () => {
  const NONEXISTENT = '00000000-0000-0000-0000-000000000000';

  it('GET /api/todos/:id - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .get(`/api/todos/${NONEXISTENT}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/todos/:id - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .put(`/api/todos/${NONEXISTENT}`)
      .set(authHeader(tokenA))
      .send({ title: '수정', startDate: '2026-04-01', dueDate: '2026-04-30' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PATCH /api/todos/:id/complete - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .patch(`/api/todos/${NONEXISTENT}/complete`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /api/todos/:id - 404를 반환해야 한다', async () => {
    const res = await request(app)
      .delete(`/api/todos/${NONEXISTENT}`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
