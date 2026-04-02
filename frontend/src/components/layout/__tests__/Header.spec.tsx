import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import Header from '../Header';

// useLogout 훅 모킹 — navigate 의존성 제거
vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ logout: vi.fn() }),
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  });

  it('로고 "Todo App"이 항상 표시된다', () => {
    renderHeader();
    expect(screen.getByText('Todo App')).toBeInTheDocument();
  });

  it('비인증 상태에서는 사용자명과 로그아웃 버튼이 표시되지 않는다', () => {
    renderHeader();
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
  });

  it('인증 상태에서 사용자명이 표시된다', () => {
    useAuthStore.setState({
      token: 'token',
      user: { id: '1', email: 'test@test.com', name: '홍길동', createdAt: '' },
      isAuthenticated: true,
    });
    renderHeader();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('인증 상태에서 로그아웃 버튼이 표시된다', () => {
    useAuthStore.setState({
      token: 'token',
      user: { id: '1', email: 'test@test.com', name: '홍길동', createdAt: '' },
      isAuthenticated: true,
    });
    renderHeader();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });
});
