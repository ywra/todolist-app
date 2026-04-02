import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import TodoItem from './TodoItem';
import TodoEditForm from './TodoEditForm';
import Modal from '@/components/common/Modal';
import { useTranslation } from '@/hooks/useTranslation';
import type { Todo, TodoFilterParams } from '@/types/todo-types';
import './TodoList.css';

interface TodoListProps {
  params: TodoFilterParams;
}

export default function TodoList({ params }: TodoListProps) {
  const { data, isLoading, isError } = useTodos(params);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-loading">{t('common.loading')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-error">{t('todo.notFound')}</span>
      </div>
    );
  }

  const todos = data?.data ?? [];

  if (todos.length === 0) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-empty">{t('todo.empty')}</span>
      </div>
    );
  }

  return (
    <>
      <div className="todo-list">
        <div className="todo-list-header">
          <span />
          <span className="todo-list-col-label">{t('todo.title')}</span>
          <span className="todo-list-col-label">{t('filter.all')}</span>
          <span className="todo-list-col-label">{t('todo.startDate')}</span>
          <span className="todo-list-col-label">{t('todo.dueDate')}</span>
          <span />
        </div>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onEditClick={setEditTodo} />
        ))}
      </div>

      {editTodo ? (
        <Modal
          isOpen={true}
          onClose={() => setEditTodo(null)}
          title={t('todo.editTitle')}
        >
          <TodoEditForm
            todo={editTodo}
            onSuccess={() => setEditTodo(null)}
            onCancel={() => setEditTodo(null)}
          />
        </Modal>
      ) : null}
    </>
  );
}
