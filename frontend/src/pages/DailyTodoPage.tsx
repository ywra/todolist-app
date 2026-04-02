import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import TodoItem from '@/components/todo/TodoItem';
import TodoCreateForm from '@/components/todo/TodoCreateForm';
import { useDailyTodos } from '@/hooks/useTodos';
import { useTranslation } from '@/hooks/useTranslation';
import type { Todo } from '@/types/todo-types';
import './DailyTodoPage.css';

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatKoreanDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}

export default function DailyTodoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useDailyTodos();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const todos: Todo[] = data?.data ?? [];
  const pending = todos.filter((todo) => !todo.isCompleted);
  const completed = todos.filter((todo) => todo.isCompleted);

  const handleEditClick = (todo: Todo) => {
    navigate(`/todos/${todo.id}`);
  };

  return (
    <Layout>
      <div className="daily-todo-page">
        <div className="daily-todo-page-header">
          <div>
            <h1 className="daily-todo-page-title">{t('todo.dailyTitle')}</h1>
            <p className="daily-todo-page-date">{formatKoreanDate(new Date())}</p>
          </div>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            {t('todo.newTodo')}
          </Button>
        </div>
        <p className="daily-todo-page-description">{t('todo.dailyDescription')}</p>

        {isLoading ? (
          <div className="daily-todo-page-loading" role="status">
            {t('common.loading')}
          </div>
        ) : todos.length === 0 ? (
          <div className="daily-todo-page-empty">
            <p>{t('todo.dailyEmpty')}</p>
          </div>
        ) : (
          <div className="daily-todo-page-list">
            {pending.length > 0 ? (
              <section className="daily-todo-section">
                <div className="daily-todo-section-list">
                  {pending.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} onEditClick={handleEditClick} />
                  ))}
                </div>
              </section>
            ) : null}

            {completed.length > 0 ? (
              <section className="daily-todo-section daily-todo-section-completed">
                <h2 className="daily-todo-section-title">
                  {t('status.completed')} ({completed.length})
                </h2>
                <div className="daily-todo-section-list">
                  {completed.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} onEditClick={handleEditClick} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}

        <div className="daily-todo-page-footer">
          <a href="/todos" className="daily-todo-all-link">
            {t('todo.myTodos')} &rarr;
          </a>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('todo.createTitle')}
      >
        <TodoCreateForm
          onSuccess={() => setCreateModalOpen(false)}
          onCancel={() => setCreateModalOpen(false)}
          defaultStartDate={getTodayString()}
          defaultDueDate={getTodayString()}
        />
      </Modal>
    </Layout>
  );
}
