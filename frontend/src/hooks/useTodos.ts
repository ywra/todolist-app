import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeTodo,
  createTodo,
  deleteTodo,
  getTodoById,
  getTodos,
  incompleteTodo,
  updateTodo,
} from '@/api/todo-api';
import type { CreateTodoRequest, TodoFilterParams, UpdateTodoRequest } from '@/types/todo-types';

export function useTodos(params: TodoFilterParams) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => getTodos(params),
  });
}

export function useTodoDetail(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => getTodoById(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useCompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useIncompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incompleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
