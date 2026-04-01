export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoData {
  userId: string;
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string | null;
  startDate?: string;
  dueDate?: string;
}

export type TodoStatus = 'pending' | 'in_progress' | 'overdue' | 'completed' | 'closed';

export type TodoSortBy = 'start_date' | 'due_date' | 'created_at';

export type TodoSortOrder = 'ASC' | 'DESC';

export interface TodoFilterOptions {
  status?: TodoStatus;
  sortBy?: TodoSortBy;
  sortOrder?: TodoSortOrder;
  page?: number;
  size?: number;
}
