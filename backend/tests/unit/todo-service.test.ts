/**
 * BE-11: todo-service 단위 테스트
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
import { Todo } from '../../src/types/todo-types';

// todoRepository mock
jest.mock('../../src/repositories/todo-repository');
import * as todoRepository from '../../src/repositories/todo-repository';

import {
  calculateTodoStatus,
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  completeTodo,
  incompleteTodo,
  deleteTodo,
} from '../../src/services/todo-service';

import { TodoStatusEnum } from '../../src/types/todo-types';

const mockCreate = todoRepository.create as jest.MockedFunction<typeof todoRepository.create>;
const mockFindById = todoRepository.findById as jest.MockedFunction<typeof todoRepository.findById>;
const mockFindByUserId = todoRepository.findByUserId as jest.MockedFunction<
  typeof todoRepository.findByUserId
>;
const mockCountByUserId = todoRepository.countByUserId as jest.MockedFunction<
  typeof todoRepository.countByUserId
>;
const mockUpdate = todoRepository.update as jest.MockedFunction<typeof todoRepository.update>;
const mockUpdateCompletionStatus = todoRepository.updateCompletionStatus as jest.MockedFunction<
  typeof todoRepository.updateCompletionStatus
>;
const mockDeleteById = todoRepository.deleteById as jest.MockedFunction<
  typeof todoRepository.deleteById
>;

const USER_ID = 'user-uuid-1234';
const OTHER_USER_ID = 'other-user-uuid-9999';
const TODO_ID = 'todo-uuid-abcd';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: TODO_ID,
    userId: USER_ID,
    title: '테스트 할일',
    description: null,
    startDate: '2026-04-01',
    dueDate: '2026-04-10',
    isCompleted: false,
    createdAt: new Date('2026-04-01T09:00:00.000Z'),
    updatedAt: new Date('2026-04-01T09:00:00.000Z'),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ----------------------------------------------------------------
// calculateTodoStatus
// ----------------------------------------------------------------
describe('calculateTodoStatus', () => {
  it('isCompleted=true이면 COMPLETED를 반환해야 한다', () => {
    expect(calculateTodoStatus('2020-01-01', '2020-01-02', true)).toBe(TodoStatusEnum.COMPLETED);
  });

  it('오늘이 startDate보다 이전이면 PENDING을 반환해야 한다', () => {
    // 미래 날짜
    const future = '2099-12-31';
    expect(calculateTodoStatus(future, future, false)).toBe(TodoStatusEnum.PENDING);
  });

  it('오늘이 startDate와 dueDate 사이(포함)이면 IN_PROGRESS를 반환해야 한다', () => {
    // 과거 startDate, 미래 dueDate
    expect(calculateTodoStatus('2020-01-01', '2099-12-31', false)).toBe(TodoStatusEnum.IN_PROGRESS);
  });

  it('오늘이 dueDate보다 이후이면 OVERDUE를 반환해야 한다', () => {
    expect(calculateTodoStatus('2020-01-01', '2020-01-02', false)).toBe(TodoStatusEnum.OVERDUE);
  });
});

// ----------------------------------------------------------------
// createTodo
// ----------------------------------------------------------------
describe('createTodo', () => {
  it('유효한 입력으로 성공 시 status가 포함된 TodoResponse를 반환해야 한다', async () => {
    const todo = makeTodo({ startDate: '2020-01-01', dueDate: '2020-01-02', isCompleted: false });
    mockCreate.mockResolvedValue(todo);

    const result = await createTodo(USER_ID, {
      title: '테스트 할일',
      startDate: '2020-01-01',
      dueDate: '2020-01-02',
    });

    expect(result).toMatchObject({ id: TODO_ID, status: TodoStatusEnum.OVERDUE });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('제목이 공백만이면 VALIDATION_ERROR를 throw해야 한다', async () => {
    await expect(
      createTodo(USER_ID, { title: '   ', startDate: '2026-04-01', dueDate: '2026-04-10' }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });

  it('제목이 200자를 초과하면 VALIDATION_ERROR를 throw해야 한다', async () => {
    await expect(
      createTodo(USER_ID, {
        title: 'a'.repeat(201),
        startDate: '2026-04-01',
        dueDate: '2026-04-10',
      }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });

  it('설명이 2000자를 초과하면 VALIDATION_ERROR를 throw해야 한다', async () => {
    await expect(
      createTodo(USER_ID, {
        title: '제목',
        description: 'a'.repeat(2001),
        startDate: '2026-04-01',
        dueDate: '2026-04-10',
      }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });

  it('날짜 형식이 올바르지 않으면 VALIDATION_ERROR를 throw해야 한다', async () => {
    await expect(
      createTodo(USER_ID, { title: '제목', startDate: '20260401', dueDate: '2026-04-10' }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });

  it('dueDate가 startDate보다 이전이면 VALIDATION_ERROR를 throw해야 한다 (BR-04)', async () => {
    await expect(
      createTodo(USER_ID, { title: '제목', startDate: '2026-04-10', dueDate: '2026-04-01' }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });
});

// ----------------------------------------------------------------
// getTodos
// ----------------------------------------------------------------
describe('getTodos', () => {
  it('기본 페이지네이션 메타가 정확해야 한다', async () => {
    const todos = [makeTodo()];
    mockFindByUserId.mockResolvedValue(todos);
    mockCountByUserId.mockResolvedValue(1);

    const result = await getTodos(USER_ID, {});

    expect(result.pagination).toEqual({
      page: 1,
      size: 20,
      totalCount: 1,
      totalPages: 1,
    });
    expect(result.todos).toHaveLength(1);
  });

  it('size가 100을 초과하면 100으로 클램핑되어야 한다', async () => {
    mockFindByUserId.mockResolvedValue([]);
    mockCountByUserId.mockResolvedValue(0);

    const result = await getTodos(USER_ID, { size: 999 });

    expect(result.pagination.size).toBe(100);
    // repository 호출 시 size=100으로 전달됐는지 확인
    const calledOptions = mockFindByUserId.mock.calls[0]?.[1];
    expect(calledOptions?.size).toBe(100);
  });

  it('totalPages가 Math.ceil(totalCount/size)로 계산되어야 한다', async () => {
    mockFindByUserId.mockResolvedValue([]);
    mockCountByUserId.mockResolvedValue(25);

    const result = await getTodos(USER_ID, { size: 10 });

    expect(result.pagination.totalPages).toBe(3);
  });
});

// ----------------------------------------------------------------
// getTodoById
// ----------------------------------------------------------------
describe('getTodoById', () => {
  it('성공 시 status가 포함된 TodoResponse를 반환해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo());

    const result = await getTodoById(USER_ID, TODO_ID);

    expect(result).toHaveProperty('status');
    expect(result.id).toBe(TODO_ID);
  });

  it('할일이 존재하지 않으면 NOT_FOUND(404)를 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(getTodoById(USER_ID, 'nonexistent')).rejects.toThrow(
      expect.objectContaining({ errorCode: 'NOT_FOUND', statusCode: 404 }),
    );
  });

  it('소유자가 다르면 FORBIDDEN(403)을 throw해야 한다 (BR-02)', async () => {
    mockFindById.mockResolvedValue(makeTodo({ userId: OTHER_USER_ID }));

    await expect(getTodoById(USER_ID, TODO_ID)).rejects.toThrow(
      expect.objectContaining({ errorCode: 'FORBIDDEN', statusCode: 403 }),
    );
  });
});

// ----------------------------------------------------------------
// updateTodo
// ----------------------------------------------------------------
describe('updateTodo', () => {
  it('성공 시 업데이트된 TodoResponse를 반환해야 한다', async () => {
    const updated = makeTodo({ title: '수정된 제목' });
    mockFindById.mockResolvedValue(makeTodo());
    mockUpdate.mockResolvedValue(updated);

    const result = await updateTodo(USER_ID, TODO_ID, {
      title: '수정된 제목',
      startDate: '2026-04-01',
      dueDate: '2026-04-10',
    });

    expect(result.title).toBe('수정된 제목');
  });

  it('소유자가 다르면 FORBIDDEN(403)을 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo({ userId: OTHER_USER_ID }));

    await expect(
      updateTodo(USER_ID, TODO_ID, {
        title: '수정',
        startDate: '2026-04-01',
        dueDate: '2026-04-10',
      }),
    ).rejects.toThrow(expect.objectContaining({ errorCode: 'FORBIDDEN' }));
  });
});

// ----------------------------------------------------------------
// completeTodo
// ----------------------------------------------------------------
describe('completeTodo', () => {
  it('성공 시 isCompleted=true인 TodoResponse를 반환해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo());
    mockUpdateCompletionStatus.mockResolvedValue(makeTodo({ isCompleted: true }));

    const result = await completeTodo(USER_ID, TODO_ID);

    expect(result.isCompleted).toBe(true);
    expect(result.status).toBe(TodoStatusEnum.COMPLETED);
  });

  it('소유자가 다르면 FORBIDDEN(403)을 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo({ userId: OTHER_USER_ID }));

    await expect(completeTodo(USER_ID, TODO_ID)).rejects.toThrow(
      expect.objectContaining({ errorCode: 'FORBIDDEN' }),
    );
  });
});

// ----------------------------------------------------------------
// incompleteTodo
// ----------------------------------------------------------------
describe('incompleteTodo', () => {
  it('성공 시 isCompleted=false인 TodoResponse를 반환해야 한다', async () => {
    const overdueTodo = makeTodo({ isCompleted: false, startDate: '2020-01-01', dueDate: '2020-01-02' });
    mockFindById.mockResolvedValue(makeTodo({ isCompleted: true }));
    mockUpdateCompletionStatus.mockResolvedValue(overdueTodo);

    const result = await incompleteTodo(USER_ID, TODO_ID);

    expect(result.isCompleted).toBe(false);
    expect(result.status).toBe(TodoStatusEnum.OVERDUE);
  });

  it('소유자가 다르면 FORBIDDEN(403)을 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo({ userId: OTHER_USER_ID }));

    await expect(incompleteTodo(USER_ID, TODO_ID)).rejects.toThrow(
      expect.objectContaining({ errorCode: 'FORBIDDEN' }),
    );
  });
});

// ----------------------------------------------------------------
// deleteTodo
// ----------------------------------------------------------------
describe('deleteTodo', () => {
  it('성공 시 void를 반환해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo());
    mockDeleteById.mockResolvedValue(true);

    await expect(deleteTodo(USER_ID, TODO_ID)).resolves.toBeUndefined();
    expect(mockDeleteById).toHaveBeenCalledWith(TODO_ID);
  });

  it('소유자가 다르면 FORBIDDEN(403)을 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(makeTodo({ userId: OTHER_USER_ID }));

    await expect(deleteTodo(USER_ID, TODO_ID)).rejects.toThrow(
      expect.objectContaining({ errorCode: 'FORBIDDEN' }),
    );
  });

  it('할일이 존재하지 않으면 NOT_FOUND(404)를 throw해야 한다', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(deleteTodo(USER_ID, 'nonexistent')).rejects.toThrow(
      expect.objectContaining({ errorCode: 'NOT_FOUND' }),
    );
  });
});
