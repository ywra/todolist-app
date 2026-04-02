import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useLogin } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import './LoginForm.css';

interface FormFields {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [fields, setFields] = useState<FormFields>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' });
  const [serverError, setServerError] = useState<string>('');

  const { mutate: login, isPending } = useLogin();
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const fieldName = name as keyof FormFields;
    setFields((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const emailError = fields.email.trim() === '' ? t('validation.emailRequired') : '';
    const passwordError = fields.password === '' ? t('validation.passwordRequired') : '';

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    login(
      { email: fields.email, password: fields.password },
      {
        onError: (error: unknown) => {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status === 401) {
            setServerError(t('auth.loginError'));
          } else {
            setServerError(t('auth.loginError'));
          }
        },
      }
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{t('auth.login')}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-card__fields">
          <Input
            label={t('auth.email')}
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            placeholder={t('auth.emailPlaceholder')}
            required
            error={errors.email || undefined}
          />
          <Input
            label={t('auth.password')}
            name="password"
            type="password"
            value={fields.password}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
            required
            error={errors.password || undefined}
          />
        </div>

        {serverError ? <div className="auth-card__error-box">{serverError}</div> : null}

        <Button type="submit" variant="primary" disabled={isPending} loading={isPending} className="auth-card__submit">
          {t('auth.loginButton')}
        </Button>
      </form>

      <p className="auth-card__footer">
        {t('auth.noAccount')}
        <Link to="/register" className="auth-card__footer-link">
          {t('auth.goToRegister')}
        </Link>
      </p>
    </div>
  );
}
