import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import './AuthPage.css';

export default function LoginPage() {
  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-page__card">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
