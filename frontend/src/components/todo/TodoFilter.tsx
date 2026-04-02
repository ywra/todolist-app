import React from 'react';
import Select from '@/components/common/Select';
import './TodoFilter.css';

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'pending', label: '시작전' },
  { value: 'in_progress', label: '진행중' },
  { value: 'overdue', label: '완료 실패' },
  { value: 'completed', label: '성공 완료' },
  { value: 'ended', label: '종료된 할일' },
];

const SORT_BY_OPTIONS = [
  { value: 'startDate', label: '시작일' },
  { value: 'dueDate', label: '종료일' },
  { value: 'createdAt', label: '생성일' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: '오름차순' },
  { value: 'desc', label: '내림차순' },
];

interface TodoFilterProps {
  status: string;
  sortBy: string;
  sortOrder: string;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
}

export default function TodoFilter({
  status,
  sortBy,
  sortOrder,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
}: TodoFilterProps) {
  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value);
  };

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortByChange(e.target.value);
  };

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortOrderChange(e.target.value);
  };

  return (
    <div className="todo-filter">
      <div className="todo-filter-group">
        <span className="todo-filter-label">필터</span>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={handleStatus}
          name="status"
        />
      </div>
      <div className="todo-filter-group">
        <span className="todo-filter-label">정렬</span>
        <Select
          options={SORT_BY_OPTIONS}
          value={sortBy}
          onChange={handleSortBy}
          name="sortBy"
        />
        <Select
          options={SORT_ORDER_OPTIONS}
          value={sortOrder}
          onChange={handleSortOrder}
          name="sortOrder"
        />
      </div>
    </div>
  );
}
