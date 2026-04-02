import { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useCompleteDailyTodo, useIncompleteDailyTodo, useDeleteDailyTodo } from '@/hooks/useDailyTodos';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/utils/date-utils';
import type { DailyTodo } from '@/types/daily-todo-types';
import './DailyTodoItem.css';

interface DailyTodoItemProps {
  todo: DailyTodo;
}

function formatDateSafe(dateStr: string): string {
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  const normalized = isoMatch ? isoMatch[1] : dateStr;
  return formatDate(normalized);
}

export default function DailyTodoItem({ todo }: DailyTodoItemProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { t } = useTranslation();

  const completeDailyTodo = useCompleteDailyTodo();
  const incompleteDailyTodo = useIncompleteDailyTodo();
  const deleteDailyTodo = useDeleteDailyTodo();

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (todo.isCompleted) {
      incompleteDailyTodo.mutate(todo.id);
    } else {
      completeDailyTodo.mutate(todo.id);
    }
  };

  const handleDeleteConfirm = () => {
    deleteDailyTodo.mutate(todo.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className={`daily-todo-item ${todo.isCompleted ? 'daily-todo-item-completed' : ''}`}>
        <input
          type="checkbox"
          className="daily-todo-item-checkbox"
          checked={todo.isCompleted}
          onChange={handleCheckbox}
          aria-label={`${todo.title} ${t('todo.complete')}`}
        />

        <span className="daily-todo-item-title">{todo.title}</span>

        <span className="daily-todo-item-date">
          {formatDateSafe(todo.startDate)} ~ {formatDateSafe(todo.dueDate)}
        </span>

        <button
          type="button"
          className="daily-todo-item-delete-btn"
          onClick={() => setDeleteModalOpen(true)}
          aria-label={t('common.delete')}
        >
          ✕
        </button>
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
