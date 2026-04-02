import apiClient from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth-types';
import type { ApiResponse } from '@/types/api-types';

export const postRegister = async (
  data: RegisterRequest,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
  return response.data;
};

export const postLogin = async (
  data: LoginRequest,
): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return response.data;
};

export const postLogout = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
  return response.data;
};
