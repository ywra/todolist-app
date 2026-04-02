import * as todoRepository from '../repositories/todo-repository';
import * as rewardService from './reward-service';
import { AppError, ERROR_CODES } from '../utils/error-utils';
import {
  Todo,
  TodoResponse,
  TodoStatusEnum,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoListQuery,
  PaginationInfo,
  TodoSortBy,
  TodoSortOrder,
} from '../types/todo-types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ----------------------------------------------------------------
// 헬퍼
// ----------------------------------------------------------------

export function calculateTodoStatus(
  startDate: string,
  dueDate: string,
  isCompleted: boolean,
): TodoStatusEnum {
  if (isCompleted) {
    return TodoStatusEnum.COMPLETED;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (today < start) {
    return TodoStatusEnum.PENDING;
  }

  if (today <= due) {
    return TodoStatusEnum.IN_PROGRESS;
  }

  return TodoStatusEnum.OVERDUE;
}

function toTodoResponse(todo: Todo): TodoResponse {
  return {
    ...todo,
    status: calculateTodoStatus(todo.startDate, todo.dueDate, todo.isCompleted),
  };
}

function validateTodoInput(data: {
  title?: string;
  description?: string | null;
  startDate?: string;
  dueDate?: string;
}): void {
  const { title, description, startDate, dueDate } = data;

  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
      );
    }
    if (title.length > 200) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
      );
    }
  }

  if (description !== undefined && description !== null) {
    if (description.length > 2000) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '설명은 최대 2,000자까지 입력할 수 있습니다.',
      );
    }
  }

  if (startDate !== undefined) {
    if (!startDate || !DATE_REGEX.test(startDate)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
      );
    }
  }

  if (dueDate !== undefined) {
    if (!dueDate || !DATE_REGEX.test(dueDate)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
      );
    }
  }

  if (startDate && dueDate) {
    if (dueDate < startDate) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, '종료일은 시작일 이후여야 합니다.');
    }
  }
}

async function findAndVerifyOwnership(todoId: string, userId: string): Promise<Todo> {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(ERROR_CODES.NOT_FOUND, '할일을 찾을 수 없습니다.');
  }
  if (todo.userId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, '해당 할일에 접근할 권한이 없습니다.');
  }
  return todo;
}

// ----------------------------------------------------------------
// 서비스 함수
// ----------------------------------------------------------------

export async function createTodo(
  userId: string,
  data: CreateTodoRequest,
): Promise<TodoResponse> {
  const { title, description, startDate, dueDate } = data;

  if (!startDate) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
    );
  }
  if (!dueDate) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
    );
  }

  validateTodoInput({ title, description, startDate, dueDate });

  const todo = await todoRepository.create(userId, title, description, startDate, dueDate);
  return toTodoResponse(todo);
}

export async function getTodos(
  userId: string,
  query: TodoListQuery,
): Promise<{ todos: TodoResponse[]; pagination: PaginationInfo }> {
  const page = Math.max(query.page ?? 1, 1);
  const size = Math.min(query.size ?? 20, 100);

  // swagger에서 sortBy는 camelCase(startDate/dueDate/createdAt)로 받을 수 있음
  // repository는 snake_case(start_date/due_date/created_at) 사용
  const sortByMap: Record<string, TodoSortBy> = {
    startDate: 'start_date',
    dueDate: 'due_date',
    createdAt: 'created_at',
    start_date: 'start_date',
    due_date: 'due_date',
    created_at: 'created_at',
  };

  const rawSortBy = query.sortBy as string | undefined;
  const sortBy: TodoSortBy = (rawSortBy && sortByMap[rawSortBy]) ? sortByMap[rawSortBy] : 'created_at';

  // swagger sortOrder는 소문자(asc/desc), repository는 대문자(ASC/DESC)
  let sortOrder: TodoSortOrder = 'DESC';
  if (query.sortOrder) {
    sortOrder = query.sortOrder.toUpperCase() as TodoSortOrder;
  }

  const filterOptions = {
    status: query.status,
    sortBy,
    sortOrder,
    page,
    size,
  };

  const [todos, totalCount] = await Promise.all([
    todoRepository.findByUserId(userId, filterOptions),
    todoRepository.countByUserId(userId, filterOptions),
  ]);

  const totalPages = Math.ceil(totalCount / size);

  return {
    todos: todos.map(toTodoResponse),
    pagination: {
      page,
      size,
      totalCount,
      totalPages,
    },
  };
}

export async function getTodoById(userId: string, todoId: string): Promise<TodoResponse> {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(ERROR_CODES.NOT_FOUND, '할일을 찾을 수 없습니다.');
  }
  if (todo.userId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, '해당 할일에 접근할 권한이 없습니다.');
  }
  return toTodoResponse(todo);
}

export async function updateTodo(
  userId: string,
  todoId: string,
  data: UpdateTodoRequest,
): Promise<TodoResponse> {
  await findAndVerifyOwnership(todoId, userId);

  const { title, description, startDate, dueDate } = data;

  if (!startDate) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
    );
  }
  if (!dueDate) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '날짜는 ISO 8601 형식 (YYYY-MM-DD)으로 입력해 주세요.',
    );
  }

  validateTodoInput({ title, description, startDate, dueDate });

  const updated = await todoRepository.update(
    todoId,
    title as string,
    description,
    startDate,
    dueDate,
  );
  return toTodoResponse(updated);
}

export async function completeTodo(userId: string, todoId: string): Promise<TodoResponse> {
  await findAndVerifyOwnership(todoId, userId);
  const updated = await todoRepository.updateCompletionStatus(todoId, true);
  // 완료 처리 후 보상 달성 여부 비동기 체크 (실패해도 응답에 영향 없음)
  rewardService.checkAndAwardRewards(userId).catch(() => {});
  return toTodoResponse(updated);
}

export async function incompleteTodo(userId: string, todoId: string): Promise<TodoResponse> {
  await findAndVerifyOwnership(todoId, userId);
  const updated = await todoRepository.updateCompletionStatus(todoId, false);
  return toTodoResponse(updated);
}

export async function getDailyTodos(userId: string): Promise<TodoResponse[]> {
  const todos = await todoRepository.findDailyByUserId(userId);
  return todos.map(toTodoResponse);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  await findAndVerifyOwnership(todoId, userId);
  await todoRepository.deleteById(todoId);
}
