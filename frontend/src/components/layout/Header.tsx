import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/useAuth';
import './Header.css';

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(isAuthenticated ? '/todos' : '/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button className="header-logo" onClick={handleLogoClick}>
          Todo App
        </button>
        {isAuthenticated && user ? (
          <div className="header-auth">
            <Link to="/profile" className="header-username">
              {user.name}
            </Link>
            <button className="header-logout-btn" onClick={logout}>
              로그아웃
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
