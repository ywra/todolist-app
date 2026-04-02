import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDailyTodos,
  createDailyTodo,
  completeDailyTodo,
  incompleteDailyTodo,
  deleteDailyTodo,
  getCalendarData,
} from '@/api/daily-todo-api';
import type { CreateDailyTodoRequest } from '@/types/daily-todo-types';

export function useDailyTodos() {
  return useQuery({
    queryKey: ['daily-todos'],
    queryFn: () => getDailyTodos(),
  });
}

export function useCreateDailyTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDailyTodoRequest) => createDailyTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-todos'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useCompleteDailyTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeDailyTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-todos'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useIncompleteDailyTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incompleteDailyTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-todos'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useDeleteDailyTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDailyTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-todos'] });
    },
  });
}

export function useDailyCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['daily-todos', 'calendar', year, month],
    queryFn: () => getCalendarData(year, month),
  });
}
