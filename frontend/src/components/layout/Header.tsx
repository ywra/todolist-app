import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useLocaleStore } from '@/stores/locale-store';
import { useLogout } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';
import './Header.css';

const LOCALE_LABELS: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
};

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useTranslation();

  const handleLogoClick = () => {
    navigate(isAuthenticated ? '/todos' : '/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button className="header-logo" onClick={handleLogoClick}>
          {t('header.appName')}
        </button>
        <div className="header-auth">
          <div className="header-locale-group">
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
              <button
                key={loc}
                className={`header-locale-btn ${locale === loc ? 'header-locale-btn-active' : ''}`}
                onClick={() => setLocale(loc)}
                aria-label={loc}
                aria-pressed={locale === loc}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>
          <button
            className="header-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="header-username">
                {user.name}
              </Link>
              <button className="header-logout-btn" onClick={logout}>
                {t('header.logout')}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
