import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  it('이메일, 비밀번호 필드 2개가 렌더링된다', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
  });

  it('빈 폼 제출 시 에러 메시지가 표시된다', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해 주세요.')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해 주세요.')).toBeInTheDocument();
    });
  });

  it('회원가입 링크가 렌더링된다', () => {
    renderLoginForm();
    const link = screen.getByRole('link', { name: '회원 가입' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });
});
