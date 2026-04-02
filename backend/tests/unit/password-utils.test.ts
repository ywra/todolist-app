/**
 * BE-05: password-utils 단위 테스트
 */

import { hashPassword, comparePassword } from '../../src/utils/password-utils';

// env.ts 검증 통과용
process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-secret-key';

describe('BE-05: password-utils', () => {
  describe('hashPassword', () => {
    it('평문 비밀번호를 bcrypt 해시로 변환해야 한다', async () => {
      const plain = 'mySecretPassword123!';
      const hash = await hashPassword(plain);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plain);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('같은 평문이라도 매번 다른 해시를 생성해야 한다 (salt)', async () => {
      const plain = 'samePassword';
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);

      expect(hash1).not.toBe(hash2);
    });

    it('빈 문자열도 해시할 수 있어야 한다', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
      expect(hash.startsWith('$2b$')).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('올바른 평문과 해시는 true를 반환해야 한다', async () => {
      const plain = 'correctPassword123!';
      const hash = await hashPassword(plain);
      const result = await comparePassword(plain, hash);

      expect(result).toBe(true);
    });

    it('잘못된 평문과 해시는 false를 반환해야 한다', async () => {
      const plain = 'correctPassword123!';
      const wrongPlain = 'wrongPassword123!';
      const hash = await hashPassword(plain);
      const result = await comparePassword(wrongPlain, hash);

      expect(result).toBe(false);
    });

    it('빈 문자열과 해시 비교가 올바르게 동작해야 한다', async () => {
      const hash = await hashPassword('nonEmpty');
      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('hashPassword와 comparePassword가 round-trip으로 동작해야 한다', async () => {
      const passwords = ['simple', 'Complex!P@ss#123', '한글비밀번호', '   spaces   '];

      for (const pwd of passwords) {
        const hash = await hashPassword(pwd);
        const isMatch = await comparePassword(pwd, hash);
        expect(isMatch).toBe(true);
      }
    });
  });
});
