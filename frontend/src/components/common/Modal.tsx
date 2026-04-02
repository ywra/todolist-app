import React, { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText,
  cancelText,
}: ModalProps) {
  const { t } = useTranslation();

  const resolvedConfirmText = confirmText ?? t('common.confirm');
  const resolvedCancelText = cancelText ?? t('common.cancel');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {title ? (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="닫기">
              ×
            </button>
          </div>
        ) : null}
        <div className="modal-body">{children}</div>
        {onConfirm ? (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              {resolvedCancelText}
            </button>
            <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
              {resolvedConfirmText}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
