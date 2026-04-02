import apiClient from './client';
import type { DailyTodo, CreateDailyTodoRequest } from '@/types/daily-todo-types';
import type { ApiResponse } from '@/types/api-types';

export const getDailyTodos = async (): Promise<ApiResponse<DailyTodo[]>> => {
  const response = await apiClient.get<ApiResponse<DailyTodo[]>>('/daily-todos');
  return response.data;
};

export const createDailyTodo = async (
  data: CreateDailyTodoRequest,
): Promise<ApiResponse<DailyTodo>> => {
  const response = await apiClient.post<ApiResponse<DailyTodo>>('/daily-todos', data);
  return response.data;
};

export const completeDailyTodo = async (id: string): Promise<ApiResponse<DailyTodo>> => {
  const response = await apiClient.patch<ApiResponse<DailyTodo>>(`/daily-todos/${id}/complete`);
  return response.data;
};

export const incompleteDailyTodo = async (id: string): Promise<ApiResponse<DailyTodo>> => {
  const response = await apiClient.patch<ApiResponse<DailyTodo>>(`/daily-todos/${id}/incomplete`);
  return response.data;
};

export const deleteDailyTodo = async (id: string): Promise<void> => {
  await apiClient.delete(`/daily-todos/${id}`);
};

export const getCalendarData = async (
  year: number,
  month: number,
): Promise<ApiResponse<DailyTodo[]>> => {
  const res = await apiClient.get<ApiResponse<DailyTodo[]>>(
    `/daily-todos/calendar?year=${year}&month=${month}`,
  );
  return res.data;
};
