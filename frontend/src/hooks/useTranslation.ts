import { useLocaleStore } from '@/stores/locale-store';
import { t as translate } from '@/i18n';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);

  const t = (key: string, params?: Record<string, string | number>): string => {
    return translate(locale, key, params);
  };

  return { t, locale };
}
