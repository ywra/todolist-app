import React from 'react';
import Select from '@/components/common/Select';
import { useTranslation } from '@/hooks/useTranslation';
import './TodoFilter.css';

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
  const { t } = useTranslation();

  const STATUS_OPTIONS = [
    { value: '', label: t('filter.all') },
    { value: 'pending', label: t('filter.pending') },
    { value: 'in_progress', label: t('filter.inProgress') },
    { value: 'overdue', label: t('filter.overdue') },
    { value: 'completed', label: t('filter.completed') },
    { value: 'ended', label: t('filter.closed') },
  ];

  const SORT_BY_OPTIONS = [
    { value: 'startDate', label: t('filter.startDate') },
    { value: 'dueDate', label: t('filter.dueDate') },
    { value: 'createdAt', label: t('filter.createdAt') },
  ];

  const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: t('filter.asc') },
    { value: 'desc', label: t('filter.desc') },
  ];

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
        <span className="todo-filter-label">{t('filter.label')}</span>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={handleStatus}
          name="status"
        />
      </div>
      <div className="todo-filter-group">
        <span className="todo-filter-label">{t('filter.sortBy')}</span>
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
