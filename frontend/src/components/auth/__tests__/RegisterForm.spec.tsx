import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';

vi.mock('@/hooks/useAuth', () => ({
  useRegister: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  it('이름, 이메일, 비밀번호 필드 3개가 렌더링된다', () => {
    renderRegisterForm();
    expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
  });

  it('빈 폼 제출 시 각 필드에 유효성 에러 메시지가 표시된다', async () => {
    renderRegisterForm();
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('이름을 입력해 주세요.')).toBeInTheDocument();
      expect(screen.getByText('이메일을 입력해 주세요.')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해 주세요.')).toBeInTheDocument();
    });
  });

  it('로그인 링크가 렌더링된다', () => {
    renderRegisterForm();
    const link = screen.getByRole('link', { name: '로그인' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });
});
