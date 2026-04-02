import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('isOpen=true일 때 모달이 렌더링된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="테스트 모달">
        <p>내용</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('테스트 모달')).toBeInTheDocument();
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('isOpen=false일 때 모달이 렌더링되지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="테스트 모달">
        <p>내용</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="테스트 모달">
        <p>내용</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="테스트 모달">
        <p>내용</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('확인 버튼 클릭 시 onConfirm이 호출된다', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="삭제">
        <p>삭제하시겠습니까?</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('확인'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="삭제">
        <p>삭제하시겠습니까?</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('취소'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirmText, cancelText prop이 버튼 텍스트에 적용된다', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="확인 모달"
        confirmText="삭제"
        cancelText="아니요"
      >
        <p>내용</p>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByText('아니요')).toBeInTheDocument();
  });
});
