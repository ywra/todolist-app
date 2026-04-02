import { TodoStatus } from '@/types/todo-types';
import { useTranslation } from '@/hooks/useTranslation';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: TodoStatus;
}

const STATUS_CLASS: Record<TodoStatus, string> = {
  [TodoStatus.PENDING]: 'badge-pending',
  [TodoStatus.IN_PROGRESS]: 'badge-in-progress',
  [TodoStatus.OVERDUE]: 'badge-overdue',
  [TodoStatus.COMPLETED]: 'badge-completed',
};

const STATUS_I18N_KEY: Record<TodoStatus, string> = {
  [TodoStatus.PENDING]: 'status.pending',
  [TodoStatus.IN_PROGRESS]: 'status.in_progress',
  [TodoStatus.OVERDUE]: 'status.overdue',
  [TodoStatus.COMPLETED]: 'status.completed',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`status-badge ${STATUS_CLASS[status]}`}>
      {t(STATUS_I18N_KEY[status])}
    </span>
  );
}
