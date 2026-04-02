import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from '../ProfilePage';

vi.mock('@/hooks/useAuth', () => ({
  useProfile: () => ({ data: undefined, isLoading: false }),
  useUpdateProfile: () => ({ mutate: vi.fn(), isPending: false }),
  useChangePassword: () => ({ mutate: vi.fn(), isPending: false }),
  useLogout: () => ({ logout: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; user: { id: string; email: string; name: string; createdAt: string } | null }) => unknown) =>
    selector({
      isAuthenticated: true,
      user: { id: '1', email: 'test@test.com', name: '홍길동', createdAt: '' },
    }),
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  it('프로필 폼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByText('프로필 수정')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('비밀번호 변경 폼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '비밀번호 변경' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('현재 비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 비밀번호를 다시 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '비밀번호 변경' })).toBeInTheDocument();
  });

  it('뒤로가기 링크가 렌더링된다', () => {
    renderPage();
    const backLink = screen.getByRole('link', { name: '← 목록으로 돌아가기' });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/todos');
  });

  it('이메일 필드에 사용자 이메일이 표시된다', () => {
    renderPage();
    const emailInput = screen.getByDisplayValue('test@test.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
  });

  it('이름 필드에 사용자 이름이 표시된다', () => {
    renderPage();
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
  });
});
