import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useLogin } from '@/hooks/useAuth';
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

    const emailError = fields.email.trim() === '' ? '이메일을 입력해 주세요.' : '';
    const passwordError = fields.password === '' ? '비밀번호를 입력해 주세요.' : '';

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
            setServerError('이메일 또는 비밀번호가 올바르지 않습니다.');
          } else {
            setServerError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
        },
      }
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">로그인</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-card__fields">
          <Input
            label="이메일"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
            error={errors.email || undefined}
          />
          <Input
            label="비밀번호"
            name="password"
            type="password"
            value={fields.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
            error={errors.password || undefined}
          />
        </div>

        {serverError ? <div className="auth-card__error-box">{serverError}</div> : null}

        <Button type="submit" variant="primary" disabled={isPending} loading={isPending} className="auth-card__submit">
          로그인
        </Button>
      </form>

      <p className="auth-card__footer">
        계정이 없으신가요?
        <Link to="/register" className="auth-card__footer-link">
          회원 가입
        </Link>
      </p>
    </div>
  );
}
