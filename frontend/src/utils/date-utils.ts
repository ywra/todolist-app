import { TodoStatus } from '@/types/todo-types';

/**
 * 시작일, 종료일, 완료 여부를 기반으로 할일 상태를 산출합니다.
 * - isCompleted === true → COMPLETED
 * - today < startDate → PENDING
 * - startDate <= today <= dueDate → IN_PROGRESS
 * - today > dueDate → OVERDUE
 */
export const computeTodoStatus = (
  startDate: string,
  dueDate: string,
  isCompleted: boolean,
): TodoStatus => {
  if (isCompleted) {
    return TodoStatus.COMPLETED;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const start = new Date(startYear!, startMonth! - 1, startDay!);

  const [dueYear, dueMonth, dueDay] = dueDate.split('-').map(Number);
  const due = new Date(dueYear!, dueMonth! - 1, dueDay!);

  if (today < start) {
    return TodoStatus.PENDING;
  }

  if (today <= due) {
    return TodoStatus.IN_PROGRESS;
  }

  return TodoStatus.OVERDUE;
};

/**
 * "YYYY-MM-DD" 형식의 날짜 문자열을 "YYYY년 MM월 DD일" 형식으로 변환합니다.
 */
export const formatDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return dateStr;
  }

  const year = parseInt(parts[0] ?? '', 10);
  const month = parseInt(parts[1] ?? '', 10);
  const day = parseInt(parts[2] ?? '', 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return dateStr;
  }

  const date = new Date(year, month - 1, day);
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return dateStr;
  }

  return `${year}년 ${month}월 ${day}일`;
};
