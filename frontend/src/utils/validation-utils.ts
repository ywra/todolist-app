/**
 * 이메일 유효성 검증
 * - RFC 5322 기본 형식
 * - 최대 255자
 * @returns 번역 키 or null (유효한 경우)
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'validation.emailRequired';
  }

  if (email.length > 255) {
    return 'validation.emailTooLong';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'validation.emailInvalid';
  }

  return null;
};

/**
 * 비밀번호 유효성 검증
 * - 8자 이상
 * - 영문, 숫자, 특수문자 각 1자 이상 포함
 * @returns 번역 키 or null (유효한 경우)
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'validation.passwordRequired';
  }

  if (password.length < 8) {
    return 'validation.passwordMinLength';
  }

  if (!/[a-zA-Z]/.test(password)) {
    return 'validation.passwordNeedLetter';
  }

  if (!/[0-9]/.test(password)) {
    return 'validation.passwordNeedNumber';
  }

  const specialCharRegex = /[!@#$%^&*()_+\-=[\]{}|;':",.<>?/]/;
  if (!specialCharRegex.test(password)) {
    return 'validation.passwordNeedSpecial';
  }

  return null;
};

/**
 * 이름 유효성 검증
 * - 1~50자
 * - 공백만으로 구성 불가
 * @returns 번역 키 or null (유효한 경우)
 */
export const validateName = (name: string): string | null => {
  if (!name) {
    return 'validation.nameRequired';
  }

  if (name.trim().length === 0) {
    return 'validation.nameWhitespace';
  }

  if (name.length > 50) {
    return 'validation.nameTooLong';
  }

  return null;
};

/**
 * 할일 제목 유효성 검증
 * - 1~200자
 * - 공백만으로 구성 불가
 * @returns 번역 키 or null (유효한 경우)
 */
export const validateTodoTitle = (title: string): string | null => {
  if (!title) {
    return 'validation.titleRequired';
  }

  if (title.trim().length === 0) {
    return 'validation.titleRequired';
  }

  if (title.length > 200) {
    return 'validation.titleTooLong';
  }

  return null;
};

/**
 * 할일 설명 유효성 검증
 * - 최대 2000자
 * @returns 번역 키 or null (유효한 경우)
 */
export const validateTodoDescription = (desc: string): string | null => {
  if (desc.length > 2000) {
    return 'validation.descriptionTooLong';
  }

  return null;
};

/**
 * 날짜 범위 유효성 검증
 * - 종료일 >= 시작일
 * @returns 번역 키 or null (유효한 경우)
 */
export const validateDateRange = (startDate: string, dueDate: string): string | null => {
  if (!startDate) {
    return 'validation.startDateRequired';
  }

  if (!dueDate) {
    return 'validation.dueDateRequired';
  }

  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (isNaN(start.getTime())) {
    return 'validation.startDateRequired';
  }

  if (isNaN(due.getTime())) {
    return 'validation.dueDateRequired';
  }

  if (due < start) {
    return 'validation.dueDateInvalid';
  }

  return null;
};
