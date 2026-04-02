import React, { useState } from 'react';
import Input from '@/components/common/Input';
import TextArea from '@/components/common/TextArea';
import Button from '@/components/common/Button';
import {
  validateTodoTitle,
  validateTodoDescription,
  validateDateRange,
} from '@/utils/validation-utils';
import { useCreateTodo } from '@/hooks/useTodos';
import { useTranslation } from '@/hooks/useTranslation';
import './TodoCreateForm.css';

interface TodoCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultStartDate?: string;
  defaultDueDate?: string;
}

export default function TodoCreateForm({ onSuccess, onCancel, defaultStartDate = '', defaultDueDate = '' }: TodoCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const createTodo = useCreateTodo();

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

    createTodo.mutate(
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
        <Button variant="primary" type="submit" loading={createTodo.isPending}>
          {t('todo.register')}
        </Button>
      </div>
    </form>
  );
}
