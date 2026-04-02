import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useRegister } from '@/hooks/useAuth';
import { validateName, validateEmail, validatePassword } from '@/utils/validation-utils';
import { useTranslation } from '@/hooks/useTranslation';
import './RegisterForm.css';

interface FormFields {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const [fields, setFields] = useState<FormFields>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({ name: '', email: '', password: '' });
  const [serverError, setServerError] = useState<string>('');

  const { mutate: register, isPending } = useRegister();
  const { t } = useTranslation();

  function validateField(name: keyof FormFields, value: string): string {
    let key: string | null = null;
    if (name === 'name') key = validateName(value);
    else if (name === 'email') key = validateEmail(value);
    else if (name === 'password') key = validatePassword(value);
    return key ? t(key) : '';
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const fieldName = name as keyof FormFields;
    setFields((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const nameError = validateField('name', fields.name);
    const emailError = validateField('email', fields.email);
    const passwordError = validateField('password', fields.password);

    setErrors({ name: nameError, email: emailError, password: passwordError });

    if (nameError || emailError || passwordError) {
      return;
    }

    register(
      { name: fields.name, email: fields.email, password: fields.password },
      {
        onError: (error: unknown) => {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status === 409) {
            setServerError(t('auth.duplicateEmail'));
          } else {
            setServerError(t('auth.loginError'));
          }
        },
      }
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{t('auth.register')}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-card__fields">
          <Input
            label={t('auth.name')}
            name="name"
            type="text"
            value={fields.name}
            onChange={handleChange}
            placeholder={t('auth.namePlaceholder')}
            required
            error={errors.name || undefined}
          />
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
          <div>
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
            <p className="auth-card__password-hint">{t('auth.passwordPolicy')}</p>
          </div>
        </div>

        {serverError ? <div className="auth-card__error-box">{serverError}</div> : null}

        <Button type="submit" variant="primary" disabled={isPending} loading={isPending} className="auth-card__submit">
          {t('auth.registerButton')}
        </Button>
      </form>

      <p className="auth-card__footer">
        {t('auth.hasAccount')}
        <Link to="/login" className="auth-card__footer-link">
          {t('auth.goToLogin')}
        </Link>
      </p>
    </div>
  );
}
