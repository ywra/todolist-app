import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoCreateForm from '../TodoCreateForm';

vi.mock('@/hooks/useTodos', () => ({
  useCreateTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderTodoCreateForm(overrides = {}) {
  const props = {
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return render(<TodoCreateForm {...props} />);
}

describe('TodoCreateForm', () => {
  it('제목 입력 필드가 렌더링된다', () => {
    renderTodoCreateForm();
    expect(screen.getByPlaceholderText('할일 제목을 입력하세요')).toBeInTheDocument();
  });

  it('설명 입력 필드가 렌더링된다', () => {
    renderTodoCreateForm();
    expect(screen.getByPlaceholderText('상세 설명을 입력하세요')).toBeInTheDocument();
  });

  it('시작일/종료일 입력 필드가 렌더링된다', () => {
    renderTodoCreateForm();
    // Input 컴포넌트는 name 속성으로 input을 구분
    const inputs = document.querySelectorAll('input[type="date"]');
    expect(inputs).toHaveLength(2);
  });

  it('등록하기, 취소 버튼이 렌더링된다', () => {
    renderTodoCreateForm();
    expect(screen.getByRole('button', { name: '등록하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('빈 폼 제출 시 제목 오류 메시지가 표시된다', async () => {
    renderTodoCreateForm();
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', () => {
    const onCancel = vi.fn();
    renderTodoCreateForm({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
