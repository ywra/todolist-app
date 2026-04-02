import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useCompleteTodo, useIncompleteTodo, useDeleteTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types/todo-types';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export default function TodoItem({ todo, onEditClick }: TodoItemProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          aria-label={`${todo.title} 완료 토글`}
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

        <span className="todo-item-date">{todo.startDate}</span>
        <span className="todo-item-date">{todo.dueDate}</span>

        <div className="todo-item-menu" ref={menuRef}>
          <button
            type="button"
            className="todo-item-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="더보기 메뉴"
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
                수정
              </button>
              <button
                type="button"
                className="todo-item-dropdown-item todo-item-dropdown-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteModalOpen(true);
                }}
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="할일 삭제"
        confirmText="삭제"
        cancelText="취소"
      >
        <p>"{todo.title}"을(를) 삭제하시겠습니까?</p>
      </Modal>
    </>
  );
}
