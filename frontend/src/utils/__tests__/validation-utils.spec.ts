import {
  validateEmail,
  validatePassword,
  validateName,
  validateTodoTitle,
  validateTodoDescription,
  validateDateRange,
} from '@/utils/validation-utils';

describe('validateEmail', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('올바른 이메일 형식이면 null을 반환한다', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('서브도메인이 포함된 이메일도 null을 반환한다', () => {
      expect(validateEmail('user@mail.example.com')).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('빈 문자열이면 오류 메시지를 반환한다', () => {
      expect(validateEmail('')).not.toBeNull();
    });

    it('@가 없으면 오류 메시지를 반환한다', () => {
      expect(validateEmail('testexample.com')).not.toBeNull();
    });

    it('도메인이 없으면 오류 메시지를 반환한다', () => {
      expect(validateEmail('test@')).not.toBeNull();
    });

    it('255자 초과이면 오류 메시지를 반환한다', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      expect(validateEmail(longEmail)).not.toBeNull();
    });

    it('255자는 유효하다', () => {
      const email = 'a'.repeat(243) + '@example.com';
      expect(email.length).toBe(255);
      expect(validateEmail(email)).toBeNull();
    });
  });
});

describe('validatePassword', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('영문+숫자+특수문자 조합 8자 이상이면 null을 반환한다', () => {
      expect(validatePassword('Pass123!')).toBeNull();
    });

    it('긴 비밀번호도 null을 반환한다', () => {
      expect(validatePassword('LongPassword123!@#')).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('빈 문자열이면 오류 메시지를 반환한다', () => {
      expect(validatePassword('')).not.toBeNull();
    });

    it('7자이면 오류 메시지를 반환한다', () => {
      expect(validatePassword('Pass12!')).not.toBeNull();
    });

    it('영문이 없으면 오류 메시지를 반환한다', () => {
      expect(validatePassword('12345678!')).not.toBeNull();
    });

    it('숫자가 없으면 오류 메시지를 반환한다', () => {
      expect(validatePassword('Password!')).not.toBeNull();
    });

    it('특수문자가 없으면 오류 메시지를 반환한다', () => {
      expect(validatePassword('Password123')).not.toBeNull();
    });
  });
});

describe('validateName', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('1자 이름은 null을 반환한다', () => {
      expect(validateName('홍')).toBeNull();
    });

    it('50자 이름은 null을 반환한다', () => {
      expect(validateName('가'.repeat(50))).toBeNull();
    });

    it('공백이 포함된 이름도 null을 반환한다 (앞뒤 공백 제외)', () => {
      expect(validateName('홍 길 동')).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('빈 문자열이면 오류 메시지를 반환한다', () => {
      expect(validateName('')).not.toBeNull();
    });

    it('공백만으로 구성되면 오류 메시지를 반환한다', () => {
      expect(validateName('   ')).not.toBeNull();
    });

    it('51자이면 오류 메시지를 반환한다', () => {
      expect(validateName('가'.repeat(51))).not.toBeNull();
    });
  });
});

describe('validateTodoTitle', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('1자 제목은 null을 반환한다', () => {
      expect(validateTodoTitle('할')).toBeNull();
    });

    it('200자 제목은 null을 반환한다', () => {
      expect(validateTodoTitle('가'.repeat(200))).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('빈 문자열이면 오류 메시지를 반환한다', () => {
      expect(validateTodoTitle('')).not.toBeNull();
    });

    it('공백만으로 구성되면 오류 메시지를 반환한다', () => {
      expect(validateTodoTitle('   ')).not.toBeNull();
    });

    it('201자이면 오류 메시지를 반환한다', () => {
      expect(validateTodoTitle('가'.repeat(201))).not.toBeNull();
    });
  });
});

describe('validateTodoDescription', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('빈 문자열은 null을 반환한다 (선택 입력)', () => {
      expect(validateTodoDescription('')).toBeNull();
    });

    it('2000자는 null을 반환한다', () => {
      expect(validateTodoDescription('가'.repeat(2000))).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('2001자이면 오류 메시지를 반환한다', () => {
      expect(validateTodoDescription('가'.repeat(2001))).not.toBeNull();
    });
  });
});

describe('validateDateRange', () => {
  describe('유효한 경우 (null 반환)', () => {
    it('종료일이 시작일과 같으면 null을 반환한다', () => {
      expect(validateDateRange('2026-04-01', '2026-04-01')).toBeNull();
    });

    it('종료일이 시작일보다 이후이면 null을 반환한다', () => {
      expect(validateDateRange('2026-04-01', '2026-04-10')).toBeNull();
    });
  });

  describe('유효하지 않은 경우 (오류 메시지 반환)', () => {
    it('시작일이 비어있으면 오류 메시지를 반환한다', () => {
      expect(validateDateRange('', '2026-04-10')).not.toBeNull();
    });

    it('종료일이 비어있으면 오류 메시지를 반환한다', () => {
      expect(validateDateRange('2026-04-01', '')).not.toBeNull();
    });

    it('종료일이 시작일보다 이전이면 오류 메시지를 반환한다', () => {
      expect(validateDateRange('2026-04-10', '2026-04-01')).not.toBeNull();
    });

    it('잘못된 날짜 형식이면 오류 메시지를 반환한다', () => {
      expect(validateDateRange('invalid', '2026-04-10')).not.toBeNull();
    });
  });
});
