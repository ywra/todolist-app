/**
 * 이메일 유효성 검증
 * - RFC 5322 기본 형식
 * - 최대 255자
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (email.length > 255) {
    return '이메일은 최대 255자까지 입력할 수 있습니다.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }

  return null;
};

/**
 * 비밀번호 유효성 검증
 * - 8자 이상
 * - 영문, 숫자, 특수문자 각 1자 이상 포함
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }

  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  if (!/[a-zA-Z]/.test(password)) {
    return '비밀번호에 영문자를 포함해야 합니다.';
  }

  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자를 포함해야 합니다.';
  }

  const specialCharRegex = /[!@#$%^&*()_+\-=[\]{}|;':",.<>?/]/;
  if (!specialCharRegex.test(password)) {
    return '비밀번호에 특수문자를 포함해야 합니다.';
  }

  return null;
};

/**
 * 이름 유효성 검증
 * - 1~50자
 * - 공백만으로 구성 불가
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validateName = (name: string): string | null => {
  if (!name) {
    return '이름을 입력해주세요.';
  }

  if (name.trim().length === 0) {
    return '이름은 공백만으로 구성할 수 없습니다.';
  }

  if (name.length < 1 || name.length > 50) {
    return '이름은 1~50자 사이로 입력해주세요.';
  }

  return null;
};

/**
 * 할일 제목 유효성 검증
 * - 1~200자
 * - 공백만으로 구성 불가
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validateTodoTitle = (title: string): string | null => {
  if (!title) {
    return '제목을 입력해주세요.';
  }

  if (title.trim().length === 0) {
    return '제목은 공백만으로 구성할 수 없습니다.';
  }

  if (title.length > 200) {
    return '제목은 최대 200자까지 입력할 수 있습니다.';
  }

  return null;
};

/**
 * 할일 설명 유효성 검증
 * - 최대 2000자
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validateTodoDescription = (desc: string): string | null => {
  if (desc.length > 2000) {
    return '설명은 최대 2,000자까지 입력할 수 있습니다.';
  }

  return null;
};

/**
 * 날짜 범위 유효성 검증
 * - 종료일 >= 시작일
 * @returns 오류 메시지 or null (유효한 경우)
 */
export const validateDateRange = (startDate: string, dueDate: string): string | null => {
  if (!startDate) {
    return '시작일을 입력해주세요.';
  }

  if (!dueDate) {
    return '종료일을 입력해주세요.';
  }

  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (isNaN(start.getTime())) {
    return '시작일이 올바른 날짜 형식이 아닙니다.';
  }

  if (isNaN(due.getTime())) {
    return '종료일이 올바른 날짜 형식이 아닙니다.';
  }

  if (due < start) {
    return '종료일은 시작일 이후여야 합니다.';
  }

  return null;
};
