import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import TodoEditForm from '@/components/todo/TodoEditForm';
import { useTodoDetail, useCompleteTodo, useIncompleteTodo, useDeleteTodo } from '@/hooks/useTodos';
import { formatDate } from '@/utils/date-utils';
import './TodoDetailPage.css';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data, isLoading, isError } = useTodoDetail(id ?? '');
  const completeTodo = useCompleteTodo();
  const incompleteTodo = useIncompleteTodo();
  const deleteTodo = useDeleteTodo();

  const todo = data?.data;

  const handleToggleComplete = () => {
    if (!todo) return;
    if (todo.isCompleted) {
      incompleteTodo.mutate(todo.id);
    } else {
      completeTodo.mutate(todo.id);
    }
  };

  const handleDeleteConfirm = () => {
    if (!todo) return;
    deleteTodo.mutate(todo.id, {
      onSuccess: () => {
        navigate('/todos');
      },
    });
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="todo-detail-state">
          <span>불러오는 중...</span>
        </div>
      </Layout>
    );
  }

  if (isError || !todo) {
    return (
      <Layout>
        <div className="todo-detail-state">
          <p className="todo-detail-not-found">할일을 찾을 수 없습니다. (404)</p>
          <Link to="/todos" className="todo-detail-back-link">
            ← 목록으로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="todo-detail-page">
        <Link to="/todos" className="todo-detail-back-link">
          ← 목록으로 돌아가기
        </Link>

        <div className="todo-detail-card">
          <div className="todo-detail-card-top">
            <StatusBadge status={todo.status} />
            <div className="todo-detail-card-actions">
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                수정
              </Button>
              <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                삭제
              </Button>
            </div>
          </div>

          <h1 className="todo-detail-title">{todo.title}</h1>
          <hr className="todo-detail-divider" />

          <section className="todo-detail-section">
            <h2 className="todo-detail-section-label">설명</h2>
            <p className="todo-detail-description">
              {todo.description || '-'}
            </p>
          </section>
          <hr className="todo-detail-divider" />

          <section className="todo-detail-section todo-detail-dates">
            <div>
              <span className="todo-detail-section-label">시작일</span>
              <span className="todo-detail-date-value">{formatDate(todo.startDate)}</span>
            </div>
            <div>
              <span className="todo-detail-section-label">종료일</span>
              <span className="todo-detail-date-value">{formatDate(todo.dueDate)}</span>
            </div>
          </section>
          <hr className="todo-detail-divider" />

          <section className="todo-detail-section todo-detail-meta">
            <div>
              <span className="todo-detail-section-label">생성일시</span>
              <span className="todo-detail-meta-value">{formatDateTime(todo.createdAt)}</span>
            </div>
            <div>
              <span className="todo-detail-section-label">최종 수정일시</span>
              <span className="todo-detail-meta-value">{formatDateTime(todo.updatedAt)}</span>
            </div>
          </section>
          <hr className="todo-detail-divider" />

          <div className="todo-detail-complete-area">
            <Button
              variant={todo.isCompleted ? 'secondary' : 'success'}
              onClick={handleToggleComplete}
              loading={completeTodo.isPending || incompleteTodo.isPending}
            >
              {todo.isCompleted ? '완료 취소' : '완료 처리'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="할일 수정"
      >
        <TodoEditForm
          todo={todo}
          onSuccess={() => setIsEditModalOpen(false)}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="할일 삭제"
        confirmText="삭제"
        cancelText="취소"
      >
        <p>"{todo.title}"을(를) 삭제하시겠습니까?</p>
      </Modal>
    </Layout>
  );
}
