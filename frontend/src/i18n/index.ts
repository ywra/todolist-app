import { ko } from './locales/ko';
import { en } from './locales/en';
import { ja } from './locales/ja';

export type Locale = 'ko' | 'en' | 'ja';

const translations = { ko, en, ja } as const;

export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[locale];

  for (const k of keys) {
    if (value == null || typeof value !== 'object') {
      return key;
    }
    value = value[k];
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const replacement = params[name];
      return replacement !== undefined ? String(replacement) : `{${name}}`;
    });
  }

  return value;
}
