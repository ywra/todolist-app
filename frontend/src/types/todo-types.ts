export const TodoStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
} as const;

export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string | null;
  startDate?: string;
  dueDate?: string;
}

export interface TodoFilterParams {
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  size?: number;
}
