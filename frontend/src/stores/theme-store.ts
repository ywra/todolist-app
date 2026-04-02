import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

type ThemeStore = ThemeState & ThemeActions;

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('todolist-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('todolist-theme', next);
      return { theme: next };
    });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem('todolist-theme', theme);
    set({ theme });
  },
}));
