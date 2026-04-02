import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useLogout } from '@/hooks/useAuth';
import './Header.css';

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleLogoClick = () => {
    navigate(isAuthenticated ? '/todos' : '/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button className="header-logo" onClick={handleLogoClick}>
          Todo App
        </button>
        <div className="header-auth">
          <button
            className="header-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="header-username">
                {user.name}
              </Link>
              <button className="header-logout-btn" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
