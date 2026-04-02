import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useRegister } from '@/hooks/useAuth';
import { validateName, validateEmail, validatePassword } from '@/utils/validation-utils';
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

  function validateField(name: keyof FormFields, value: string): string {
    if (name === 'name') return validateName(value) ?? '';
    if (name === 'email') return validateEmail(value) ?? '';
    if (name === 'password') return validatePassword(value) ?? '';
    return '';
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
            setServerError('이미 사용 중인 이메일입니다.');
          } else {
            setServerError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
        },
      }
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">회원 가입</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-card__fields">
          <Input
            label="이름"
            name="name"
            type="text"
            value={fields.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
            error={errors.name || undefined}
          />
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
          <div>
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
            <p className="auth-card__password-hint">8자 이상, 영문+숫자+특수문자 포함</p>
          </div>
        </div>

        {serverError ? <div className="auth-card__error-box">{serverError}</div> : null}

        <Button type="submit" variant="primary" disabled={isPending} loading={isPending} className="auth-card__submit">
          가입하기
        </Button>
      </form>

      <p className="auth-card__footer">
        이미 계정이 있으신가요?
        <Link to="/login" className="auth-card__footer-link">
          로그인
        </Link>
      </p>
    </div>
  );
}
