import { create } from 'zustand';
import type { User } from '@/types/auth-types';

const STORAGE_KEY = 'todolist-auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

type AuthStore = AuthState & AuthActions;

function loadFromStorage(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { token, user } = JSON.parse(stored);
      if (token && user) {
        return { token, user, isAuthenticated: true };
      }
    }
  } catch {
    // 파싱 실패 시 기본값 반환
  }
  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...loadFromStorage(),

  setAuth: (token: string, user: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  getToken: () => {
    return get().token;
  },
}));
