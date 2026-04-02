import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoListPage from '../TodoListPage';

vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ logout: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; user: null }) => unknown) =>
    selector({ isAuthenticated: true, user: null }),
}));

vi.mock('@/hooks/useTodos', () => ({
  useTodos: () => ({
    data: { data: [], pagination: { page: 1, size: 20, totalCount: 0, totalPages: 0 } },
    isLoading: false,
    isError: false,
  }),
  useCreateTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useCompleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useIncompleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TodoListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoListPage', () => {
  it('페이지 제목 "내 할일 목록"이 렌더링된다', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '내 할일 목록' })).toBeInTheDocument();
  });

  it('"+ 새 할일 등록" 버튼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '+ 새 할일 등록' })).toBeInTheDocument();
  });

  it('빈 목록 시 "등록된 할일이 없습니다." 안내가 표시된다', () => {
    renderPage();
    expect(screen.getByText('등록된 할일이 없습니다.')).toBeInTheDocument();
  });

  it('"+ 새 할일 등록" 버튼 클릭 시 등록 모달이 열린다', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '+ 새 할일 등록' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('새 할일 등록')).toBeInTheDocument();
  });

  it('필터 섹션이 렌더링된다', () => {
    renderPage();
    expect(screen.getByText('필터')).toBeInTheDocument();
    expect(screen.getByText('정렬')).toBeInTheDocument();
  });
});
