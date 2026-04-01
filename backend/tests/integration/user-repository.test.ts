/**
 * DB-07: user-repository 통합 테스트
 *
 * src/repositories/user-repository.ts 가 pool을 src/config/db 에서 가져오므로,
 * jest.mock 으로 해당 모듈을 테스트 전용 Pool로 교체한다.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 로드 (env.ts 모듈 검증 전에 환경 변수를 채운다)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { testPool, truncateTables } from './test-pool';

// src/config/db 모듈을 testPool로 교체
jest.mock('../../src/config/db', () => ({
  pool: testPool,
  testConnection: jest.fn(),
}));

import {
  createUser,
  findByEmail,
  findById,
} from '../../src/repositories/user-repository';

describe('DB-07: UserRepository 통합 테스트', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await testPool.end();
  });

  // ---------------------------------------------------------------
  // 1. 사용자 생성 성공
  // ---------------------------------------------------------------
  it('사용자 생성 성공', async () => {
    const user = await createUser('alice@example.com', 'hashed_pw_1', 'Alice');

    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  // ---------------------------------------------------------------
  // 2. 이메일로 조회 성공 (password 포함)
  // ---------------------------------------------------------------
  it('이메일로 조회 성공 - password 포함', async () => {
    await createUser('bob@example.com', 'hashed_pw_2', 'Bob');

    const found = await findByEmail('bob@example.com');

    expect(found).not.toBeNull();
    expect(found!.email).toBe('bob@example.com');
    expect(found!.name).toBe('Bob');
    expect(found!.password).toBe('hashed_pw_2');
  });

  // ---------------------------------------------------------------
  // 3. 존재하지 않는 이메일 조회 시 null 반환
  // ---------------------------------------------------------------
  it('존재하지 않는 이메일 조회 시 null 반환', async () => {
    const found = await findByEmail('nobody@example.com');
    expect(found).toBeNull();
  });

  // ---------------------------------------------------------------
  // 4. ID로 조회 성공 (password 제외)
  // ---------------------------------------------------------------
  it('ID로 조회 성공 - password 제외', async () => {
    const created = await createUser('carol@example.com', 'hashed_pw_3', 'Carol');

    const found = await findById(created.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
    expect(found!.email).toBe('carol@example.com');
    expect(found!.name).toBe('Carol');
    // password 필드가 없어야 한다
    expect((found as unknown as Record<string, unknown>)['password']).toBeUndefined();
  });

  // ---------------------------------------------------------------
  // 5. 이메일 UNIQUE 제약 위반 시 에러
  // ---------------------------------------------------------------
  it('이메일 UNIQUE 위반 시 에러 발생', async () => {
    await createUser('dup@example.com', 'hashed_pw_4', 'Dup1');

    await expect(
      createUser('dup@example.com', 'hashed_pw_5', 'Dup2'),
    ).rejects.toThrow();
  });
});
