import apiClient from './client';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilterParams,
} from '@/types/todo-types';
import type { ApiResponse, ApiListResponse } from '@/types/api-types';


export const getTodos = async (
  params: TodoFilterParams,
): Promise<ApiListResponse<Todo>> => {
  const response = await apiClient.get<ApiListResponse<Todo>>('/todos', { params });
  return response.data;
};

export const getTodoById = async (id: string): Promise<ApiResponse<Todo>> => {
  const response = await apiClient.get<ApiResponse<Todo>>(`/todos/${id}`);
  return response.data;
};

export const createTodo = async (
  data: CreateTodoRequest,
): Promise<ApiResponse<Todo>> => {
  const response = await apiClient.post<ApiResponse<Todo>>('/todos', data);
  return response.data;
};

export const updateTodo = async (
  id: string,
  data: UpdateTodoRequest,
): Promise<ApiResponse<Todo>> => {
  const response = await apiClient.put<ApiResponse<Todo>>(`/todos/${id}`, data);
  return response.data;
};

export const completeTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  const response = await apiClient.patch<ApiResponse<Todo>>(`/todos/${id}/complete`);
  return response.data;
};

export const incompleteTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  const response = await apiClient.patch<ApiResponse<Todo>>(`/todos/${id}/incomplete`);
  return response.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await apiClient.delete(`/todos/${id}`);
};
