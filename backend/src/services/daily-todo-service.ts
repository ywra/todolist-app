import * as dailyTodoRepository from '../repositories/daily-todo-repository';
import * as rewardService from './reward-service';
import { AppError, ERROR_CODES } from '../utils/error-utils';
import { DailyTodo, CreateDailyTodoRequest } from '../types/daily-todo-types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateInput(data: {
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

async function findAndVerifyOwnership(todoId: string, userId: string): Promise<DailyTodo> {
  const todo = await dailyTodoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(ERROR_CODES.NOT_FOUND, '오늘의 할일을 찾을 수 없습니다.');
  }
  if (todo.userId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, '해당 오늘의 할일에 접근할 권한이 없습니다.');
  }
  return todo;
}

export async function createDailyTodo(
  userId: string,
  data: CreateDailyTodoRequest,
): Promise<DailyTodo> {
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

  validateInput({ title, description, startDate, dueDate });

  return dailyTodoRepository.create(userId, title, description, startDate, dueDate);
}

export async function getDailyTodos(userId: string): Promise<DailyTodo[]> {
  return dailyTodoRepository.findDailyByUserId(userId);
}

export async function completeDailyTodo(
  userId: string,
  todoId: string,
): Promise<DailyTodo> {
  await findAndVerifyOwnership(todoId, userId);
  const updated = await dailyTodoRepository.updateCompletionStatus(todoId, true);
  rewardService.checkAndAwardRewards(userId).catch(() => {});
  return updated;
}

export async function incompleteDailyTodo(
  userId: string,
  todoId: string,
): Promise<DailyTodo> {
  await findAndVerifyOwnership(todoId, userId);
  return dailyTodoRepository.updateCompletionStatus(todoId, false);
}

export async function deleteDailyTodo(userId: string, todoId: string): Promise<void> {
  await findAndVerifyOwnership(todoId, userId);
  await dailyTodoRepository.deleteById(todoId);
}
