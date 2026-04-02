export interface DailyTodo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyTodoRequest {
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
}
