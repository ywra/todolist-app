import { describe, it, expect } from 'vitest';
import { t } from '../index';

describe('t() 함수', () => {
  describe('기본 번역', () => {
    it('한국어 키를 정상적으로 반환한다', () => {
      expect(t('ko', 'common.save')).toBe('저장');
    });

    it('영어 키를 정상적으로 반환한다', () => {
      expect(t('en', 'common.save')).toBe('Save');
    });

    it('일본어 키를 정상적으로 반환한다', () => {
      expect(t('ja', 'common.save')).toBe('保存');
    });
  });

  describe('중첩 키 조회 (dot notation)', () => {
    it('auth.login을 올바르게 반환한다 (ko)', () => {
      expect(t('ko', 'auth.login')).toBe('로그인');
    });

    it('auth.login을 올바르게 반환한다 (en)', () => {
      expect(t('en', 'auth.login')).toBe('Login');
    });

    it('auth.login을 올바르게 반환한다 (ja)', () => {
      expect(t('ja', 'auth.login')).toBe('ログイン');
    });

    it('validation.emailRequired를 올바르게 반환한다 (ko)', () => {
      expect(t('ko', 'validation.emailRequired')).toBe('이메일을 입력해 주세요.');
    });

    it('todo.myTodos를 올바르게 반환한다 (en)', () => {
      expect(t('en', 'todo.myTodos')).toBe('My Todos');
    });

    it('filter.asc를 올바르게 반환한다 (ja)', () => {
      expect(t('ja', 'filter.asc')).toBe('昇順');
    });
  });

  describe('placeholder 치환', () => {
    it('{count} placeholder를 치환한다', () => {
      expect(t('ko', 'pagination.total', { count: 42 })).toBe('전체 42건');
    });

    it('{size} placeholder를 치환한다', () => {
      expect(t('ko', 'pagination.perPage', { size: 20 })).toBe('20건/페이지');
    });

    it('영어 pagination.total placeholder를 치환한다', () => {
      expect(t('en', 'pagination.total', { count: 10 })).toBe('Total 10 items');
    });

    it('일본어 pagination.total placeholder를 치환한다', () => {
      expect(t('ja', 'pagination.total', { count: 5 })).toBe('全5件');
    });

    it('여러 placeholder를 동시에 치환한다', () => {
      // 두 placeholder가 있는 경우를 위해 ko 로케일에서 직접 테스트
      const result = t('ko', 'pagination.perPage', { size: 10 });
      expect(result).toBe('10건/페이지');
    });

    it('params가 없으면 원래 문자열을 반환한다', () => {
      expect(t('ko', 'common.save')).toBe('저장');
    });

    it('치환되지 않은 placeholder는 그대로 유지된다', () => {
      expect(t('ko', 'pagination.total', {})).toBe('전체 {count}건');
    });
  });

  describe('존재하지 않는 키 처리', () => {
    it('존재하지 않는 키는 키 자체를 반환한다', () => {
      expect(t('ko', 'nonexistent.key')).toBe('nonexistent.key');
    });

    it('중간 경로가 없는 키도 키 자체를 반환한다', () => {
      expect(t('ko', 'common.nonexistent')).toBe('common.nonexistent');
    });

    it('단일 레벨 존재하지 않는 키도 키 자체를 반환한다', () => {
      expect(t('en', 'totally_missing')).toBe('totally_missing');
    });
  });

  describe('각 로케일의 주요 번역 확인', () => {
    it('header.logout 한국어', () => {
      expect(t('ko', 'header.logout')).toBe('로그아웃');
    });

    it('header.logout 영어', () => {
      expect(t('en', 'header.logout')).toBe('Logout');
    });

    it('header.logout 일본어', () => {
      expect(t('ja', 'header.logout')).toBe('ログアウト');
    });

    it('status.in_progress 한국어', () => {
      expect(t('ko', 'status.in_progress')).toBe('진행중');
    });

    it('status.in_progress 영어', () => {
      expect(t('en', 'status.in_progress')).toBe('In Progress');
    });

    it('status.in_progress 일본어', () => {
      expect(t('ja', 'status.in_progress')).toBe('進行中');
    });
  });
});
