import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoFilter from '../TodoFilter';

function renderTodoFilter(overrides = {}) {
  const props = {
    status: '',
    sortBy: 'startDate',
    sortOrder: 'asc',
    onStatusChange: vi.fn(),
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn(),
    ...overrides,
  };
  return render(<TodoFilter {...props} />);
}

describe('TodoFilter', () => {
  it('상태 필터 Select가 렌더링된다', () => {
    renderTodoFilter();
    const statusSelect = screen.getByDisplayValue('전체');
    expect(statusSelect).toBeInTheDocument();
  });

  it('정렬 기준 Select가 렌더링된다', () => {
    renderTodoFilter();
    const sortBySelect = screen.getByDisplayValue('시작일');
    expect(sortBySelect).toBeInTheDocument();
  });

  it('정렬 방향 Select가 렌더링된다', () => {
    renderTodoFilter();
    const sortOrderSelect = screen.getByDisplayValue('오름차순');
    expect(sortOrderSelect).toBeInTheDocument();
  });

  it('상태 필터 변경 시 onStatusChange가 호출된다', () => {
    const onStatusChange = vi.fn();
    renderTodoFilter({ onStatusChange });
    const statusSelect = screen.getByDisplayValue('전체');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });
    expect(onStatusChange).toHaveBeenCalledWith('pending');
  });

  it('정렬 기준 변경 시 onSortByChange가 호출된다', () => {
    const onSortByChange = vi.fn();
    renderTodoFilter({ onSortByChange });
    const sortBySelect = screen.getByDisplayValue('시작일');
    fireEvent.change(sortBySelect, { target: { value: 'dueDate' } });
    expect(onSortByChange).toHaveBeenCalledWith('dueDate');
  });

  it('정렬 방향 변경 시 onSortOrderChange가 호출된다', () => {
    const onSortOrderChange = vi.fn();
    renderTodoFilter({ onSortOrderChange });
    const sortOrderSelect = screen.getByDisplayValue('오름차순');
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });
    expect(onSortOrderChange).toHaveBeenCalledWith('desc');
  });

  it('필터 레이블이 렌더링된다', () => {
    renderTodoFilter();
    expect(screen.getByText('필터')).toBeInTheDocument();
    expect(screen.getByText('정렬')).toBeInTheDocument();
  });
});
