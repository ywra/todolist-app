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

  const updateTodo = useUpdateTodo();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError = validateTodoTitle(title);
    if (titleError) newErrors['title'] = titleError;

    const descError = validateTodoDescription(description);
    if (descError) newErrors['description'] = descError;

    const dateError = validateDateRange(startDate, dueDate);
    if (dateError) newErrors['date'] = dateError;

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
        label="제목"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors['title']}
        placeholder="할일 제목을 입력하세요"
        name="title"
      />

      <TextArea
        label="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors['description']}
        placeholder="상세 설명을 입력하세요"
        maxLength={2000}
        name="description"
      />

      <div className="todo-edit-form-dates">
        <Input
          label="시작일"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          name="startDate"
        />
        <Input
          label="종료일"
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
          취소
        </Button>
        <Button variant="primary" type="submit" loading={updateTodo.isPending}>
          저장하기
        </Button>
      </div>
    </form>
  );
}
