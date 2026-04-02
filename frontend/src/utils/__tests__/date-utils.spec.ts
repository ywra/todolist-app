import { computeTodoStatus, formatDate } from '@/utils/date-utils';
import { TodoStatus } from '@/types/todo-types';

describe('computeTodoStatus', () => {
  const toIsoDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 5);

  describe('COMPLETED', () => {
    it('isCompleted가 true이면 날짜에 관계없이 COMPLETED를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(yesterday), toIsoDate(yesterday), true),
      ).toBe(TodoStatus.COMPLETED);
    });

    it('미래 날짜이더라도 isCompleted가 true면 COMPLETED를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(tomorrow), toIsoDate(dayAfterTomorrow), true),
      ).toBe(TodoStatus.COMPLETED);
    });
  });

  describe('PENDING', () => {
    it('today < startDate이면 PENDING을 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(tomorrow), toIsoDate(dayAfterTomorrow), false),
      ).toBe(TodoStatus.PENDING);
    });
  });

  describe('IN_PROGRESS', () => {
    it('startDate <= today <= dueDate이면 IN_PROGRESS를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(yesterday), toIsoDate(tomorrow), false),
      ).toBe(TodoStatus.IN_PROGRESS);
    });

    it('시작일과 종료일이 오늘인 경우 IN_PROGRESS를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(today), toIsoDate(today), false),
      ).toBe(TodoStatus.IN_PROGRESS);
    });

    it('시작일이 오늘이고 종료일이 미래이면 IN_PROGRESS를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(today), toIsoDate(tomorrow), false),
      ).toBe(TodoStatus.IN_PROGRESS);
    });
  });

  describe('OVERDUE', () => {
    it('today > dueDate이면 OVERDUE를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(pastDate), toIsoDate(yesterday), false),
      ).toBe(TodoStatus.OVERDUE);
    });

    it('시작일이 과거이고 종료일도 어제이면 OVERDUE를 반환한다', () => {
      expect(
        computeTodoStatus(toIsoDate(pastDate), toIsoDate(yesterday), false),
      ).toBe(TodoStatus.OVERDUE);
    });
  });
});

describe('formatDate', () => {
  it('YYYY-MM-DD 형식을 YYYY년 MM월 DD일 형식으로 변환한다', () => {
    const result = formatDate('2026-04-01');
    expect(result).toBe('2026년 4월 1일');
  });

  it('월과 일이 두 자리인 경우 올바르게 변환한다', () => {
    const result = formatDate('2026-12-31');
    expect(result).toBe('2026년 12월 31일');
  });

  it('잘못된 날짜 문자열은 원본을 반환한다', () => {
    const result = formatDate('invalid-date');
    expect(result).toBe('invalid-date');
  });
});
