import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailyTodoPage from '../DailyTodoPage';

vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ logout: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; user: null }) => unknown) =>
    selector({ isAuthenticated: true, user: null }),
}));

const mockUseDailyTodos = vi.fn();

vi.mock('@/hooks/useDailyTodos', () => ({
  useDailyTodos: () => mockUseDailyTodos(),
  useCreateDailyTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useCompleteDailyTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useIncompleteDailyTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteDailyTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/daily']}>
        <DailyTodoPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DailyTodoPage', () => {
  it('페이지 제목 "오늘의 할일"이 렌더링된다', () => {
    mockUseDailyTodos.mockReturnValue({ data: { data: [], success: true }, isLoading: false });
    renderPage();
    expect(screen.getByRole('heading', { name: '오늘의 할일' })).toBeInTheDocument();
  });

  it('isLoading이 true일 때 로딩 메시지가 표시된다', () => {
    mockUseDailyTodos.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('빈 목록 시 "오늘 해야 할 할일이 없습니다." 안내가 표시된다', () => {
    mockUseDailyTodos.mockReturnValue({ data: { data: [], success: true }, isLoading: false });
    renderPage();
    expect(screen.getByText('오늘 해야 할 할일이 없습니다.')).toBeInTheDocument();
  });

  it('"내 할일 목록 →" 링크가 /todos로 이동한다', () => {
    mockUseDailyTodos.mockReturnValue({ data: { data: [], success: true }, isLoading: false });
    renderPage();
    const link = screen.getByRole('link', { name: /내 할일 목록/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/todos');
  });
});
