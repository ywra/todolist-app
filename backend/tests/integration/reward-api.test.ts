/**
 * 보상 API 통합 테스트
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
  email: `reward_a_${TS}@example.com`,
  password: 'Password1!',
  name: '보상사용자A',
};

let tokenA: string;
let userAId: string;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send(USER_A);
  const loginA = await request(app).post('/api/auth/login').send({
    email: USER_A.email,
    password: USER_A.password,
  });
  tokenA = loginA.body.data.token as string;
  userAId = loginA.body.data.user.id as string;
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email LIKE $1', [`reward_%_${TS}@example.com`]);
  } catch (_) {
    // 정리 실패 무시
  }
  await pool.end();
});

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ----------------------------------------------------------------
// POST /api/rewards - 보상 생성
// ----------------------------------------------------------------
describe('POST /api/rewards - 보상 생성', () => {
  it('마일스톤 10 보상을 생성하면 201을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .set(authHeader(tokenA))
      .send({ milestone: 10, title: '작은 보상', description: '10개 완료 보상' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      milestone: 10,
      tier: 'small',
      title: '작은 보상',
      description: '10개 완료 보상',
      isAchieved: false,
    });
    expect(res.body.data).toHaveProperty('id');
  });

  it('마일스톤 30 보상을 생성하면 201을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .set(authHeader(tokenA))
      .send({ milestone: 30, title: '중간 보상' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ milestone: 30, tier: 'medium' });
  });

  it('마일스톤 100 보상을 생성하면 201을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .set(authHeader(tokenA))
      .send({ milestone: 100, title: '큰 보상' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ milestone: 100, tier: 'large' });
  });

  it('중복 마일스톤 생성 시 400 VALIDATION_ERROR를 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .set(authHeader(tokenA))
      .send({ milestone: 10, title: '중복 보상' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('유효하지 않은 마일스톤(50)으로 생성 시 400을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .set(authHeader(tokenA))
      .send({ milestone: 50, title: '잘못된 마일스톤' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/api/rewards')
      .send({ milestone: 10, title: '무인증 보상' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ----------------------------------------------------------------
// GET /api/rewards - 진행 현황 조회
// ----------------------------------------------------------------
describe('GET /api/rewards - 진행 현황 조회', () => {
  it('진행 현황을 조회하면 200과 RewardProgress를 반환해야 한다', async () => {
    const res = await request(app)
      .get('/api/rewards')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      completedCount: expect.any(Number),
      rewards: expect.any(Array),
      progressToNext: expect.any(Number),
    });
    // nextMilestone은 number 또는 null
    expect(
      res.body.data.nextMilestone === null ||
      typeof res.body.data.nextMilestone === 'number',
    ).toBe(true);
  });

  it('보상이 3개 모두 존재하면 rewards 배열 길이가 3이어야 한다', async () => {
    const res = await request(app)
      .get('/api/rewards')
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.rewards).toHaveLength(3);
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app).get('/api/rewards');
    expect(res.status).toBe(401);
  });
});

// ----------------------------------------------------------------
// PUT /api/rewards/:id - 보상 수정
// ----------------------------------------------------------------
describe('PUT /api/rewards/:id - 보상 수정', () => {
  let rewardId: string;

  beforeAll(async () => {
    const res = await request(app)
      .get('/api/rewards')
      .set(authHeader(tokenA));
    rewardId = res.body.data.rewards[0].id as string;
  });

  it('보상 제목과 설명을 수정하면 200과 수정된 보상을 반환해야 한다', async () => {
    const res = await request(app)
      .put(`/api/rewards/${rewardId}`)
      .set(authHeader(tokenA))
      .send({ title: '수정된 보상 제목', description: '수정된 설명' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('수정된 보상 제목');
    expect(res.body.data.description).toBe('수정된 설명');
  });

  it('존재하지 않는 보상 ID로 수정 시 404를 반환해야 한다', async () => {
    const res = await request(app)
      .put('/api/rewards/00000000-0000-0000-0000-000000000000')
      .set(authHeader(tokenA))
      .send({ title: '없는 보상' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('인증 없이 호출하면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .put(`/api/rewards/${rewardId}`)
      .send({ title: '무인증 수정' });

    expect(res.status).toBe(401);
  });
});

// ----------------------------------------------------------------
// 할일 10개 완료 후 자동 달성 확인
// ----------------------------------------------------------------
describe('할일 10개 완료 후 자동 달성 확인', () => {
  let autoTokenB: string;

  beforeAll(async () => {
    // 별도 사용자 생성
    const autoUser = {
      email: `reward_auto_${TS}@example.com`,
      password: 'Password1!',
      name: '자동달성테스트',
    };
    await request(app).post('/api/auth/register').send(autoUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: autoUser.email,
      password: autoUser.password,
    });
    autoTokenB = loginRes.body.data.token as string;

    // 마일스톤 10 보상 생성
    await request(app)
      .post('/api/rewards')
      .set(authHeader(autoTokenB))
      .send({ milestone: 10, title: '자동 달성 보상' });

    // 할일 10개 생성 후 완료 처리
    for (let i = 0; i < 10; i++) {
      const createRes = await request(app)
        .post('/api/todos')
        .set(authHeader(autoTokenB))
        .send({
          title: `자동달성 할일 ${i + 1}`,
          startDate: '2026-01-01',
          dueDate: '2026-12-31',
        });
      const todoId = createRes.body.data.id as string;
      await request(app)
        .patch(`/api/todos/${todoId}/complete`)
        .set(authHeader(autoTokenB));
    }
  });

  it('할일 10개 완료 후 진행현황 조회 시 마일스톤 10 보상이 달성되어야 한다', async () => {
    // checkAndAwardRewards가 비동기 fire-and-forget이므로 getRewardProgress에서 처리됨
    const res = await request(app)
      .get('/api/rewards')
      .set(authHeader(autoTokenB));

    expect(res.status).toBe(200);
    const reward10 = res.body.data.rewards.find(
      (r: { milestone: number }) => r.milestone === 10,
    );
    expect(reward10).toBeDefined();
    expect(reward10.isAchieved).toBe(true);
    expect(reward10.achievedAt).not.toBeNull();
  });

  it('completedCount가 10 이상이어야 한다', async () => {
    const res = await request(app)
      .get('/api/rewards')
      .set(authHeader(autoTokenB));

    expect(res.body.data.completedCount).toBeGreaterThanOrEqual(10);
  });
});
