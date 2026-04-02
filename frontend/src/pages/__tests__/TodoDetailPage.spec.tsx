import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoDetailPage from '../TodoDetailPage';

vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ logout: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; user: null }) => unknown) =>
    selector({ isAuthenticated: true, user: null }),
}));

// useTodoDetail을 동적으로 제어할 수 있도록 hoisted mock 변수 사용
const mockUseTodoDetail = vi.fn();

vi.mock('@/hooks/useTodos', () => ({
  useTodoDetail: (id: string) => mockUseTodoDetail(id),
  useUpdateTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useCompleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
  useIncompleteTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos/123']}>
        <Routes>
          <Route path="/todos/:id" element={<TodoDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoDetailPage', () => {
  it('로딩 상태에서 로딩 텍스트가 표시된다', () => {
    mockUseTodoDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderPage();
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('뒤로가기 링크가 렌더링된다', () => {
    mockUseTodoDetail.mockReturnValue({
      data: {
        success: true,
        data: {
          id: '123',
          userId: 'user1',
          title: 'React 공부하기',
          description: '공식 문서 정독',
          startDate: '2026-04-01',
          dueDate: '2026-04-05',
          isCompleted: false,
          status: 'in_progress',
          createdAt: '2026-04-01T09:00:00Z',
          updatedAt: '2026-04-01T14:30:00Z',
        },
      },
      isLoading: false,
      isError: false,
    });
    renderPage();
    const link = screen.getByRole('link', { name: /목록으로 돌아가기/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/todos');
  });

  it('할일 제목이 표시된다', () => {
    mockUseTodoDetail.mockReturnValue({
      data: {
        success: true,
        data: {
          id: '123',
          userId: 'user1',
          title: 'React 공부하기',
          description: '공식 문서 정독',
          startDate: '2026-04-01',
          dueDate: '2026-04-05',
          isCompleted: false,
          status: 'in_progress',
          createdAt: '2026-04-01T09:00:00Z',
          updatedAt: '2026-04-01T14:30:00Z',
        },
      },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByRole('heading', { name: 'React 공부하기' })).toBeInTheDocument();
  });

  it('수정/삭제 버튼이 렌더링된다', () => {
    mockUseTodoDetail.mockReturnValue({
      data: {
        success: true,
        data: {
          id: '123',
          userId: 'user1',
          title: 'React 공부하기',
          description: null,
          startDate: '2026-04-01',
          dueDate: '2026-04-05',
          isCompleted: false,
          status: 'in_progress',
          createdAt: '2026-04-01T09:00:00Z',
          updatedAt: '2026-04-01T14:30:00Z',
        },
      },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('완료 처리 버튼이 렌더링된다 (미완료 상태)', () => {
    mockUseTodoDetail.mockReturnValue({
      data: {
        success: true,
        data: {
          id: '123',
          userId: 'user1',
          title: 'React 공부하기',
          description: null,
          startDate: '2026-04-01',
          dueDate: '2026-04-05',
          isCompleted: false,
          status: 'in_progress',
          createdAt: '2026-04-01T09:00:00Z',
          updatedAt: '2026-04-01T14:30:00Z',
        },
      },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByRole('button', { name: '완료 처리' })).toBeInTheDocument();
  });
});
