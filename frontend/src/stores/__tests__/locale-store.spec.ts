import { describe, it, expect, beforeEach } from 'vitest';
import { useLocaleStore } from '../locale-store';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLocaleStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useLocaleStore.setState({ locale: 'ko' });
  });

  describe('setLocale', () => {
    it('setLocale("en")을 호출하면 locale이 en으로 변경된다', () => {
      useLocaleStore.getState().setLocale('en');
      expect(useLocaleStore.getState().locale).toBe('en');
    });

    it('setLocale("ja")을 호출하면 locale이 ja로 변경된다', () => {
      useLocaleStore.getState().setLocale('ja');
      expect(useLocaleStore.getState().locale).toBe('ja');
    });

    it('setLocale("ko")을 호출하면 locale이 ko로 변경된다', () => {
      useLocaleStore.setState({ locale: 'en' });
      useLocaleStore.getState().setLocale('ko');
      expect(useLocaleStore.getState().locale).toBe('ko');
    });
  });

  describe('localStorage 저장', () => {
    it('setLocale 호출 시 localStorage에 저장된다', () => {
      useLocaleStore.getState().setLocale('en');
      expect(localStorageMock.getItem('todolist-locale')).toBe('en');
    });

    it('setLocale("ja") 호출 시 localStorage에 "ja"가 저장된다', () => {
      useLocaleStore.getState().setLocale('ja');
      expect(localStorageMock.getItem('todolist-locale')).toBe('ja');
    });

    it('setLocale("ko") 호출 시 localStorage에 "ko"가 저장된다', () => {
      useLocaleStore.getState().setLocale('ko');
      expect(localStorageMock.getItem('todolist-locale')).toBe('ko');
    });
  });

  describe('localStorage 복원', () => {
    it('setState로 locale을 설정하면 해당 값이 반환된다', () => {
      useLocaleStore.setState({ locale: 'ja' });
      expect(useLocaleStore.getState().locale).toBe('ja');
    });

    it('여러 번 setLocale 호출 시 마지막 값이 유지된다', () => {
      useLocaleStore.getState().setLocale('en');
      useLocaleStore.getState().setLocale('ja');
      useLocaleStore.getState().setLocale('ko');
      expect(useLocaleStore.getState().locale).toBe('ko');
      expect(localStorageMock.getItem('todolist-locale')).toBe('ko');
    });
  });
});
