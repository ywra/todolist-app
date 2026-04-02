import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useCompleteTodo, useIncompleteTodo, useDeleteTodo } from '@/hooks/useTodos';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/utils/date-utils';
import type { Todo } from '@/types/todo-types';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

function formatDateSafe(dateStr: string): string {
  // ISO 문자열(2026-04-01T15:00:00.000Z)이면 YYYY-MM-DD 부분만 추출
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  const normalized = isoMatch ? isoMatch[1] : dateStr;
  return formatDate(normalized);
}

export default function TodoItem({ todo, onEditClick }: TodoItemProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const completeTodo = useCompleteTodo();
  const incompleteTodo = useIncompleteTodo();
  const deleteTodo = useDeleteTodo();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (todo.isCompleted) {
      incompleteTodo.mutate(todo.id);
    } else {
      completeTodo.mutate(todo.id);
    }
  };

  const handleTitleClick = () => {
    navigate(`/todos/${todo.id}`);
  };

  const handleDeleteConfirm = () => {
    deleteTodo.mutate(todo.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className={`todo-item ${todo.isCompleted ? 'todo-item-completed' : ''}`}>
        <input
          type="checkbox"
          className="todo-item-checkbox"
          checked={todo.isCompleted}
          onChange={handleCheckbox}
          aria-label={`${todo.title} ${t('todo.complete')}`}
        />

        <button
          type="button"
          className="todo-item-title"
          onClick={handleTitleClick}
        >
          {todo.title}
        </button>

        <div className="todo-item-badge">
          <StatusBadge status={todo.status} />
        </div>

        <span className="todo-item-date">{formatDateSafe(todo.startDate)}</span>
        <span className="todo-item-date">{formatDateSafe(todo.dueDate)}</span>

        <div className="todo-item-menu" ref={menuRef}>
          <button
            type="button"
            className="todo-item-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t('common.edit')}
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="todo-item-dropdown">
              <button
                type="button"
                className="todo-item-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  onEditClick(todo);
                }}
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                className="todo-item-dropdown-item todo-item-dropdown-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteModalOpen(true);
                }}
              >
                {t('common.delete')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('common.delete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      >
        <p>{t('todo.deleteConfirm')}</p>
        <p>{t('todo.deleteWarning')}</p>
      </Modal>
    </>
  );
}
