import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DailyCalendar, { getTodosForDate } from '../DailyCalendar';
import type { DailyTodo } from '@/types/daily-todo-types';

vi.mock('@/hooks/useDailyTodos', () => ({
  useDailyCalendar: () => ({ data: { data: [] } }),
}));

function makeTodo(overrides: Partial<DailyTodo> = {}): DailyTodo {
  return {
    id: '1',
    userId: 'user-1',
    title: '테스트 할일',
    description: null,
    startDate: '2026-04-01',
    dueDate: '2026-04-30',
    isCompleted: false,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  };
}

function renderCalendar(onDateSelect = vi.fn()) {
  return render(<DailyCalendar onDateSelect={onDateSelect} />);
}

describe('DailyCalendar', () => {
  it('달력이 렌더링된다', () => {
    renderCalendar();
    expect(screen.getByTestId('daily-calendar')).toBeInTheDocument();
  });

  it('이전 달 버튼이 렌더링된다', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: '이전 달' })).toBeInTheDocument();
  });

  it('다음 달 버튼이 렌더링된다', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument();
  });

  it('요일 헤더(일~토)가 렌더링된다', () => {
    renderCalendar();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach((wd) => {
      expect(screen.getAllByText(wd).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('오늘 날짜 셀이 today 클래스를 가진다', () => {
    renderCalendar();
    const todayCell = document.querySelector('.daily-calendar-cell--today');
    expect(todayCell).not.toBeNull();
  });

  it('이전 달 버튼 클릭 시 월이 변경된다', () => {
    renderCalendar();
    const title = screen.getByText(/년.+월/);
    const originalText = title.textContent ?? '';

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }));

    const newTitle = screen.getByText(/년.+월/);
    expect(newTitle.textContent).not.toBe(originalText);
  });

  it('다음 달 버튼 클릭 시 월이 변경된다', () => {
    renderCalendar();
    const title = screen.getByText(/년.+월/);
    const originalText = title.textContent ?? '';

    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));

    const newTitle = screen.getByText(/년.+월/);
    expect(newTitle.textContent).not.toBe(originalText);
  });

  it('날짜 클릭 시 onDateSelect가 호출된다', () => {
    const onDateSelect = vi.fn();
    renderCalendar(onDateSelect);

    const cells = document.querySelectorAll('.daily-calendar-cell:not(.daily-calendar-cell--empty)');
    if (cells.length > 0) {
      fireEvent.click(cells[0]!);
      expect(onDateSelect).toHaveBeenCalledTimes(1);
    }
  });
});

describe('getTodosForDate', () => {
  it('날짜 범위에 포함되는 할일을 반환한다', () => {
    const todos = [
      makeTodo({ startDate: '2026-04-01', dueDate: '2026-04-10' }),
      makeTodo({ id: '2', startDate: '2026-04-15', dueDate: '2026-04-20' }),
    ];
    const result = getTodosForDate(todos, '2026-04-05');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('날짜가 start_date와 같은 경우 포함된다', () => {
    const todos = [makeTodo({ startDate: '2026-04-10', dueDate: '2026-04-20' })];
    expect(getTodosForDate(todos, '2026-04-10')).toHaveLength(1);
  });

  it('날짜가 due_date와 같은 경우 포함된다', () => {
    const todos = [makeTodo({ startDate: '2026-04-10', dueDate: '2026-04-20' })];
    expect(getTodosForDate(todos, '2026-04-20')).toHaveLength(1);
  });

  it('날짜가 범위 밖이면 반환하지 않는다', () => {
    const todos = [makeTodo({ startDate: '2026-04-10', dueDate: '2026-04-20' })];
    expect(getTodosForDate(todos, '2026-04-09')).toHaveLength(0);
    expect(getTodosForDate(todos, '2026-04-21')).toHaveLength(0);
  });

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(getTodosForDate([], '2026-04-10')).toHaveLength(0);
  });
});
