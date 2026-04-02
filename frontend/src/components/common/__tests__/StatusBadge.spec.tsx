import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge';
import { TodoStatus } from '@/types/todo-types';

describe('StatusBadge', () => {
  it('PENDING 상태를 "시작전"으로 렌더링한다', () => {
    render(<StatusBadge status={TodoStatus.PENDING} />);
    expect(screen.getByText('시작전')).toBeInTheDocument();
    expect(screen.getByText('시작전')).toHaveClass('badge-pending');
  });

  it('IN_PROGRESS 상태를 "진행중"으로 렌더링한다', () => {
    render(<StatusBadge status={TodoStatus.IN_PROGRESS} />);
    expect(screen.getByText('진행중')).toBeInTheDocument();
    expect(screen.getByText('진행중')).toHaveClass('badge-in-progress');
  });

  it('OVERDUE 상태를 "완료 실패"로 렌더링한다', () => {
    render(<StatusBadge status={TodoStatus.OVERDUE} />);
    expect(screen.getByText('완료 실패')).toBeInTheDocument();
    expect(screen.getByText('완료 실패')).toHaveClass('badge-overdue');
  });

  it('COMPLETED 상태를 "성공 완료"로 렌더링한다', () => {
    render(<StatusBadge status={TodoStatus.COMPLETED} />);
    expect(screen.getByText('성공 완료')).toBeInTheDocument();
    expect(screen.getByText('성공 완료')).toHaveClass('badge-completed');
  });
});
