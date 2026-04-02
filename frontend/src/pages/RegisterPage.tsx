import Layout from '@/components/layout/Layout';
import RegisterForm from '@/components/auth/RegisterForm';
import './AuthPage.css';

export default function RegisterPage() {
  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-page__card auth-page__card--wide">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
}
