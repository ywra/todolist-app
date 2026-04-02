import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postLogin, postLogout, postRegister, getProfile, updateProfile, changePassword } from '@/api/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth-types';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => postLogin(data),
    onSuccess: (response) => {
      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/todos');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => postRegister(data),
    onSuccess: () => {
      navigate('/login');
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (token) {
        setAuth(token, response.data);
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return {
    logout: async () => {
      try {
        await postLogout();
      } catch {
        // 로그아웃 API 실패해도 로컬 상태 초기화
      }
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  };
}
