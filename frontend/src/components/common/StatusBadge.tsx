import { TodoStatus } from '@/types/todo-types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: TodoStatus;
}

const STATUS_CONFIG: Record<TodoStatus, { label: string; className: string }> = {
  [TodoStatus.PENDING]: { label: '시작전', className: 'badge-pending' },
  [TodoStatus.IN_PROGRESS]: { label: '진행중', className: 'badge-in-progress' },
  [TodoStatus.OVERDUE]: { label: '완료 실패', className: 'badge-overdue' },
  [TodoStatus.COMPLETED]: { label: '성공 완료', className: 'badge-completed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
