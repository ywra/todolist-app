import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import TodoItem from './TodoItem';
import TodoEditForm from './TodoEditForm';
import Modal from '@/components/common/Modal';
import type { Todo, TodoFilterParams } from '@/types/todo-types';
import './TodoList.css';

interface TodoListProps {
  params: TodoFilterParams;
}

export default function TodoList({ params }: TodoListProps) {
  const { data, isLoading, isError } = useTodos(params);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  if (isLoading) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-loading">불러오는 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-error">목록을 불러오지 못했습니다.</span>
      </div>
    );
  }

  const todos = data?.data ?? [];

  if (todos.length === 0) {
    return (
      <div className="todo-list-state">
        <span className="todo-list-empty">등록된 할일이 없습니다.</span>
      </div>
    );
  }

  return (
    <>
      <div className="todo-list">
        <div className="todo-list-header">
          <span />
          <span className="todo-list-col-label">제목</span>
          <span className="todo-list-col-label">상태</span>
          <span className="todo-list-col-label">시작일</span>
          <span className="todo-list-col-label">종료일</span>
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
          title="할일 수정"
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
