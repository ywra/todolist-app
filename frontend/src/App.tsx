import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import TodoListPage from '@/pages/TodoListPage';
import TodoDetailPage from '@/pages/TodoDetailPage';
import ProfilePage from '@/pages/ProfilePage';

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Routes>
      {/* 공개 페이지 — 인증 시 /todos 리다이렉트 */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 보호 페이지 — 비인증 시 /login 리다이렉트 */}
      <Route element={<PrivateRoute />}>
        <Route path="/todos" element={<TodoListPage />} />
        <Route path="/todos/:id" element={<TodoDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 루트 — 인증 상태 기반 리다이렉트 */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/todos' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
