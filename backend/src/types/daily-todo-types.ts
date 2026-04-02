export interface DailyTodo {
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

export interface CreateDailyTodoRequest {
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
}
