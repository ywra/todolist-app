import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postLogin, postLogout, postRegister } from '@/api/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginRequest, RegisterRequest } from '@/types/auth-types';

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
