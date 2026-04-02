import { create } from 'zustand';
import type { User } from '@/types/auth-types';

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

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token: string, user: User) => {
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ token: null, user: null, isAuthenticated: false });
  },

  getToken: () => {
    return get().token;
  },
}));
