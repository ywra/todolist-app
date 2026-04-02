import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import TextArea from '@/components/common/TextArea';
import Modal from '@/components/common/Modal';
import DailyTodoItem from '@/components/todo/DailyTodoItem';
import { useDailyTodos, useCreateDailyTodo } from '@/hooks/useDailyTodos';
import { useTranslation } from '@/hooks/useTranslation';
import {
  validateTodoTitle,
  validateTodoDescription,
  validateDateRange,
} from '@/utils/validation-utils';
import type { DailyTodo } from '@/types/daily-todo-types';
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

interface DailyTodoCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function DailyTodoCreateForm({ onSuccess, onCancel }: DailyTodoCreateFormProps) {
  const today = getTodayString();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const createDailyTodo = useCreateDailyTodo();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleKey = validateTodoTitle(title);
    if (titleKey) newErrors['title'] = t(titleKey);

    const descKey = validateTodoDescription(description);
    if (descKey) newErrors['description'] = t(descKey);

    const dateKey = validateDateRange(startDate, dueDate);
    if (dateKey) newErrors['date'] = t(dateKey);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createDailyTodo.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        startDate,
        dueDate,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <form className="todo-create-form" onSubmit={handleSubmit} noValidate>
      <Input
        label={t('todo.title')}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors['title']}
        placeholder={t('todo.titlePlaceholder')}
        name="title"
      />

      <TextArea
        label={t('todo.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors['description']}
        placeholder={t('todo.descriptionPlaceholder')}
        maxLength={2000}
        name="description"
      />

      <div className="todo-create-form-dates">
        <Input
          label={t('todo.startDate')}
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          name="startDate"
        />
        <Input
          label={t('todo.dueDate')}
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          name="dueDate"
        />
      </div>

      {errors['date'] ? (
        <p className="todo-create-form-error">{errors['date']}</p>
      ) : null}

      <div className="todo-create-form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={createDailyTodo.isPending}>
          {t('todo.register')}
        </Button>
      </div>
    </form>
  );
}

export default function DailyTodoPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useDailyTodos();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const todos: DailyTodo[] = data?.data ?? [];
  const pending = todos.filter((todo) => !todo.isCompleted);
  const completed = todos.filter((todo) => todo.isCompleted);

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
                    <DailyTodoItem key={todo.id} todo={todo} />
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
                    <DailyTodoItem key={todo.id} todo={todo} />
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
        <DailyTodoCreateForm
          onSuccess={() => setCreateModalOpen(false)}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>
    </Layout>
  );
}
