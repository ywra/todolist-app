export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
}

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
