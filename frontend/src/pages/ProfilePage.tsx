import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { validateName, validatePassword } from '@/utils/validation-utils';
import './ProfilePage.css';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  useProfile();

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

    const error = validateName(name);
    setNameError(error);
    if (error) return;

    updateProfileMutation.mutate(
      { name },
      {
        onSuccess: () => {
          setProfileSuccess('프로필이 성공적으로 저장되었습니다.');
        },
        onError: () => {
          setProfileError('프로필 저장에 실패했습니다. 다시 시도해주세요.');
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
      setCurrentPasswordError('현재 비밀번호를 입력해주세요.');
      hasError = true;
    } else {
      setCurrentPasswordError(null);
    }

    const newPwError = validatePassword(newPassword);
    setNewPasswordError(newPwError);
    if (newPwError) hasError = true;

    if (!confirmPassword) {
      setConfirmPasswordError('새 비밀번호 확인을 입력해주세요.');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('새 비밀번호가 일치하지 않습니다.');
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: () => {
          setPasswordError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
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
              ← 목록으로 돌아가기
            </Link>
            <h1 className="profile-card-title">내 정보 수정</h1>
          </div>

          {/* 프로필 수정 섹션 */}
          <section className="profile-section">
            <h2 className="profile-section-title">프로필 수정</h2>
            <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
              <Input
                label="이메일"
                type="email"
                value={user?.email ?? ''}
                disabled
              />
              <Input
                label="이름"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError ?? undefined}
                required
                placeholder="이름을 입력해주세요"
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
                  저장
                </Button>
              </div>
            </form>
          </section>

          {/* 비밀번호 변경 섹션 */}
          <section className="profile-section">
            <h2 className="profile-section-title">비밀번호 변경</h2>
            <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
              <Input
                label="현재 비밀번호"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={currentPasswordError ?? undefined}
                required
                placeholder="현재 비밀번호를 입력해주세요"
              />
              <Input
                label="새 비밀번호"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={newPasswordError ?? undefined}
                required
                placeholder="새 비밀번호를 입력해주세요"
              />
              <Input
                label="새 비밀번호 확인"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError ?? undefined}
                required
                placeholder="새 비밀번호를 다시 입력해주세요"
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
                  비밀번호 변경
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
