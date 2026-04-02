import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('onClick 이벤트가 호출된다', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭이 동작하지 않는다', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>클릭</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading 상태에서 버튼이 비활성화된다', () => {
    render(<Button loading>클릭</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading 상태에서 spinner가 렌더링된다', () => {
    render(<Button loading>클릭</Button>);
    expect(document.querySelector('.btn-spinner')).toBeInTheDocument();
  });

  it('variant가 className에 적용된다', () => {
    render(<Button variant="danger">삭제</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('type="submit"이 적용된다', () => {
    render(<Button type="submit">제출</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
