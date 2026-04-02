import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { validateName, validatePassword } from '@/utils/validation-utils';
import { useTranslation } from '@/hooks/useTranslation';
import './ProfilePage.css';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  useProfile();
  const { t } = useTranslation();

  // 프로필 수정 상태
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    const errorKey = validateName(name);
    const errorMsg = errorKey ? t(errorKey) : null;
    setNameError(errorMsg);
    if (errorMsg) return;

    updateProfileMutation.mutate(
      { name },
      {
        onSuccess: () => {
          setProfileSuccess(t('profile.profileUpdated'));
        },
        onError: () => {
          setProfileError(t('profile.profileUpdated'));
        },
      },
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError(t('validation.passwordRequired'));
      hasError = true;
    } else {
      setCurrentPasswordError(null);
    }

    const newPwKey = validatePassword(newPassword);
    const newPwMsg = newPwKey ? t(newPwKey) : null;
    setNewPasswordError(newPwMsg);
    if (newPwMsg) hasError = true;

    if (!confirmPassword) {
      setConfirmPasswordError(t('validation.passwordRequired'));
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('profile.passwordMismatch'));
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess(t('profile.passwordChanged'));
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: () => {
          setPasswordError(t('profile.passwordMismatch'));
        },
      },
    );
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-card-header">
            <Link to="/todos" className="profile-back-link">
              ← {t('common.back')}
            </Link>
            <h1 className="profile-card-title">{t('profile.title')}</h1>
          </div>

          {/* 프로필 수정 섹션 */}
          <section className="profile-section">
            <h2 className="profile-section-title">{t('profile.editProfile')}</h2>
            <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
              <Input
                label={t('auth.email')}
                type="email"
                value={user?.email ?? ''}
                disabled
              />
              <Input
                label={t('auth.name')}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError ?? undefined}
                required
                placeholder={t('auth.namePlaceholder')}
              />
              {profileSuccess ? (
                <p className="profile-alert profile-alert-success" role="status">
                  {profileSuccess}
                </p>
              ) : null}
              {profileError ? (
                <p className="profile-alert profile-alert-error" role="alert">
                  {profileError}
                </p>
              ) : null}
              <div className="profile-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateProfileMutation.isPending}
                >
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </section>

          {/* 비밀번호 변경 섹션 */}
          <section className="profile-section">
            <h2 className="profile-section-title">{t('profile.changePassword')}</h2>
            <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
              <Input
                label={t('profile.currentPassword')}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={currentPasswordError ?? undefined}
                required
                placeholder={t('profile.currentPassword')}
              />
              <Input
                label={t('profile.newPassword')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={newPasswordError ?? undefined}
                required
                placeholder={t('profile.newPassword')}
              />
              <Input
                label={t('profile.confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError ?? undefined}
                required
                placeholder={t('profile.confirmPassword')}
              />
              {passwordSuccess ? (
                <p className="profile-alert profile-alert-success" role="status">
                  {passwordSuccess}
                </p>
              ) : null}
              {passwordError ? (
                <p className="profile-alert profile-alert-error" role="alert">
                  {passwordError}
                </p>
              ) : null}
              <div className="profile-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={changePasswordMutation.isPending}
                >
                  {t('profile.changePassword')}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
