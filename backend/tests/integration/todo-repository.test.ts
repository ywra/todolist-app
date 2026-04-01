/**
 * DB-07: todo-repository 통합 테스트
 *
 * src/repositories/todo-repository.ts 가 pool을 src/config/db 에서 가져오므로,
 * jest.mock 으로 해당 모듈을 테스트 전용 Pool로 교체한다.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { testPool, truncateTables } from './test-pool';

jest.mock('../../src/config/db', () => ({
  pool: testPool,
  testConnection: jest.fn(),
}));

import {
  create,
  findById,
  findByUserId,
  update,
  updateCompletionStatus,
  deleteById,
} from '../../src/repositories/todo-repository';

import { createUser } from '../../src/repositories/user-repository';

// 테스트 공용 사용자 ID
let userId: string;

describe('DB-07: TodoRepository 통합 테스트', () => {
  beforeEach(async () => {
    await truncateTables();
    // 각 테스트에서 사용할 공용 사용자 생성
    const user = await createUser(`user_${Date.now()}@example.com`, 'hashed_pw', 'TestUser');
    userId = user.id;
  });

  afterAll(async () => {
    await testPool.end();
  });

  // ---------------------------------------------------------------
  // 1. 할일 생성 성공
  // ---------------------------------------------------------------
  it('할일 생성 성공', async () => {
    const todo = await create(userId, '첫 번째 할일', '설명입니다', '2026-04-01', '2026-04-10');

    expect(todo.id).toBeDefined();
    expect(todo.userId).toBe(userId);
    expect(todo.title).toBe('첫 번째 할일');
    expect(todo.description).toBe('설명입니다');
    expect(todo.startDate).toBe('2026-04-01');
    expect(todo.dueDate).toBe('2026-04-10');
    expect(todo.isCompleted).toBe(false);
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });

  // ---------------------------------------------------------------
  // 2. 할일 단건 조회
  // ---------------------------------------------------------------
  it('할일 단건 조회 성공', async () => {
    const created = await create(userId, '단건 조회 테스트', null, '2026-04-01', '2026-04-15');

    const found = await findById(created.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
    expect(found!.title).toBe('단건 조회 테스트');
    expect(found!.description).toBeNull();
  });

  // ---------------------------------------------------------------
  // 3. 할일 수정 (updated_at 갱신 확인)
  // ---------------------------------------------------------------
  it('할일 수정 후 updated_at이 갱신된다', async () => {
    const created = await create(userId, '원래 제목', '원래 설명', '2026-04-01', '2026-04-10');
    const originalUpdatedAt = created.updatedAt;

    // updated_at 차이를 만들기 위해 1ms 대기
    await new Promise((resolve) => setTimeout(resolve, 50));

    const updated = await update(created.id, '수정된 제목', '수정된 설명', '2026-04-02', '2026-04-12');

    expect(updated.title).toBe('수정된 제목');
    expect(updated.description).toBe('수정된 설명');
    expect(updated.startDate).toBe('2026-04-02');
    expect(updated.dueDate).toBe('2026-04-12');
    // updated_at이 생성 시점보다 같거나 이후여야 한다
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });

  // ---------------------------------------------------------------
  // 4. 완료 상태 변경
  // ---------------------------------------------------------------
  it('완료 상태를 true로 변경한다', async () => {
    const todo = await create(userId, '완료 테스트', null, '2026-04-01', '2026-04-10');
    expect(todo.isCompleted).toBe(false);

    const completed = await updateCompletionStatus(todo.id, true);
    expect(completed.isCompleted).toBe(true);

    // 다시 false로 되돌리기
    const reverted = await updateCompletionStatus(todo.id, false);
    expect(reverted.isCompleted).toBe(false);
  });

  // ---------------------------------------------------------------
  // 5. 할일 삭제
  // ---------------------------------------------------------------
  it('할일 삭제 성공 후 조회 시 null 반환', async () => {
    const todo = await create(userId, '삭제할 할일', null, '2026-04-01', '2026-04-10');

    const deleted = await deleteById(todo.id);
    expect(deleted).toBe(true);

    const found = await findById(todo.id);
    expect(found).toBeNull();
  });

  it('존재하지 않는 할일 삭제 시 false 반환', async () => {
    const result = await deleteById('00000000-0000-0000-0000-000000000000');
    expect(result).toBe(false);
  });

  // ---------------------------------------------------------------
  // 6. 사용자별 할일 목록 조회 + 페이지네이션
  // ---------------------------------------------------------------
  it('사용자별 할일 목록 조회 및 페이지네이션', async () => {
    // 5개의 할일 생성
    for (let i = 1; i <= 5; i++) {
      await create(userId, `할일 ${i}`, null, '2026-04-01', `2026-04-${10 + i}`);
    }

    // 전체 조회
    const all = await findByUserId(userId);
    expect(all).toHaveLength(5);

    // 페이지네이션: 2개씩, 1페이지
    const page1 = await findByUserId(userId, { size: 2, page: 1 });
    expect(page1).toHaveLength(2);

    // 페이지네이션: 2개씩, 2페이지
    const page2 = await findByUserId(userId, { size: 2, page: 2 });
    expect(page2).toHaveLength(2);

    // 페이지네이션: 2개씩, 3페이지 (마지막 1개)
    const page3 = await findByUserId(userId, { size: 2, page: 3 });
    expect(page3).toHaveLength(1);

    // 다른 사용자의 할일은 조회되지 않아야 한다
    const other = await createUser(`other_${Date.now()}@example.com`, 'pw', 'Other');
    const otherTodos = await findByUserId(other.id);
    expect(otherTodos).toHaveLength(0);
  });

  // ---------------------------------------------------------------
  // 7. due_date < start_date CHECK 제약 위반 시 에러
  // ---------------------------------------------------------------
  it('due_date가 start_date보다 이전이면 에러 발생 (CHECK 제약)', async () => {
    await expect(
      create(userId, '날짜 오류 할일', null, '2026-04-10', '2026-04-01'),
    ).rejects.toThrow();
  });

  // ---------------------------------------------------------------
  // 8. FK CASCADE: 사용자 삭제 시 연관 할일 자동 삭제
  // ---------------------------------------------------------------
  it('사용자 삭제 시 연관 할일이 CASCADE로 자동 삭제된다', async () => {
    // 할일 3개 생성
    const todo1 = await create(userId, 'cascade 테스트 1', null, '2026-04-01', '2026-04-10');
    const todo2 = await create(userId, 'cascade 테스트 2', null, '2026-04-01', '2026-04-11');
    const todo3 = await create(userId, 'cascade 테스트 3', null, '2026-04-01', '2026-04-12');

    // 생성 확인
    expect(await findById(todo1.id)).not.toBeNull();
    expect(await findById(todo2.id)).not.toBeNull();
    expect(await findById(todo3.id)).not.toBeNull();

    // 사용자 삭제 (CASCADE)
    await testPool.query('DELETE FROM users WHERE id = $1', [userId]);

    // 연관 할일이 자동 삭제되었는지 확인
    expect(await findById(todo1.id)).toBeNull();
    expect(await findById(todo2.id)).toBeNull();
    expect(await findById(todo3.id)).toBeNull();
  });
});
