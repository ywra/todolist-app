import { create } from 'zustand';
import type { Locale } from '@/i18n';

interface LocaleState {
  locale: Locale;
}

interface LocaleActions {
  setLocale: (locale: Locale) => void;
}

type LocaleStore = LocaleState & LocaleActions;

function getInitialLocale(): Locale {
  const stored = localStorage.getItem('todolist-locale');
  if (stored === 'ko' || stored === 'en' || stored === 'ja') return stored;

  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('ja')) return 'ja';
  }

  return 'ko';
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: getInitialLocale(),

  setLocale: (locale: Locale) => {
    localStorage.setItem('todolist-locale', locale);
    set({ locale });
  },
}));
