import React, { useState } from 'react';
import Input from '@/components/common/Input';
import TextArea from '@/components/common/TextArea';
import Button from '@/components/common/Button';
import {
  validateTodoTitle,
  validateTodoDescription,
  validateDateRange,
} from '@/utils/validation-utils';
import { useUpdateTodo } from '@/hooks/useTodos';
import { useTranslation } from '@/hooks/useTranslation';
import type { Todo } from '@/types/todo-types';
import './TodoEditForm.css';

interface TodoEditFormProps {
  todo: Todo;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TodoEditForm({ todo, onSuccess, onCancel }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [startDate, setStartDate] = useState(todo.startDate);
  const [dueDate, setDueDate] = useState(todo.dueDate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const updateTodo = useUpdateTodo();

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

    updateTodo.mutate(
      {
        id: todo.id,
        data: {
          title: title.trim(),
          description: description.trim() || null,
          startDate,
          dueDate,
        },
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <form className="todo-edit-form" onSubmit={handleSubmit} noValidate>
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

      <div className="todo-edit-form-dates">
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
        <p className="todo-edit-form-error">{errors['date']}</p>
      ) : null}

      <div className="todo-edit-form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={updateTodo.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
