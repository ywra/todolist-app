import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import TodoFilter from '@/components/todo/TodoFilter';
import TodoList from '@/components/todo/TodoList';
import TodoCreateForm from '@/components/todo/TodoCreateForm';
import { useTodos } from '@/hooks/useTodos';
import './TodoListPage.css';

const PAGE_SIZE = 20;

export default function TodoListPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);

  const params = {
    status: status || undefined,
    sortBy,
    sortOrder,
    page,
    size: PAGE_SIZE,
  };

  const { data } = useTodos(params);
  const pagination = data?.pagination;

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setPage(1);
  };

  return (
    <Layout>
      <div className="todo-list-page">
        <div className="todo-list-page-header">
          <h1 className="todo-list-page-title">내 할일 목록</h1>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + 새 할일 등록
          </Button>
        </div>

        <TodoFilter
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onStatusChange={handleStatusChange}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
        />

        <TodoList params={params} />

        {pagination && pagination.totalPages > 1 ? (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 할일 등록"
      >
        <TodoCreateForm
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </Layout>
  );
}
