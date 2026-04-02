import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      // 로그인/회원가입 API의 401은 리다이렉트하지 않음 (폼에서 에러 메시지 표시)
      const url = error.config?.url ?? '';
      const isAuthApi = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthApi) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
