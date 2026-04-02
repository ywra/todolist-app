import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '@/types/auth-types';
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

export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
  return response.data;
};

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.put<ApiResponse<{ message: string }>>(
    '/auth/profile/password',
    data,
  );
  return response.data;
};
