import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
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
    useThemeStore.setState({ theme: 'light' });
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

  it('테마 토글 버튼이 항상 표시된다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /다크 모드로 전환|라이트 모드로 전환/ })).toBeInTheDocument();
  });

  it('라이트 모드일 때 토글 버튼에 🌙 아이콘이 표시된다', () => {
    useThemeStore.setState({ theme: 'light' });
    renderHeader();
    const btn = screen.getByRole('button', { name: '다크 모드로 전환' });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toBe('🌙');
  });

  it('다크 모드일 때 토글 버튼에 ☀️ 아이콘이 표시된다', () => {
    useThemeStore.setState({ theme: 'dark' });
    renderHeader();
    const btn = screen.getByRole('button', { name: '라이트 모드로 전환' });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toBe('☀️');
  });

  it('테마 토글 버튼 클릭 시 테마가 변경된다', () => {
    useThemeStore.setState({ theme: 'light' });
    renderHeader();
    const btn = screen.getByRole('button', { name: '다크 모드로 전환' });
    fireEvent.click(btn);
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
