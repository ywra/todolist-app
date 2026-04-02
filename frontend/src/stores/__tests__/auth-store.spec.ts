import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/auth-types';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: '테스트 사용자',
  createdAt: '2026-04-01T00:00:00.000Z',
};

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('useAuthStore', () => {
  describe('초기 상태', () => {
    it('token이 null이다', () => {
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('user가 null이다', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('isAuthenticated가 false이다', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('token과 user를 설정하고 isAuthenticated를 true로 변경한다', () => {
      useAuthStore.getState().setAuth('jwt-token-123', mockUser);

      const state = useAuthStore.getState();
      expect(state.token).toBe('jwt-token-123');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('토큰을 새 값으로 업데이트할 수 있다', () => {
      useAuthStore.getState().setAuth('old-token', mockUser);
      useAuthStore.getState().setAuth('new-token', mockUser);

      expect(useAuthStore.getState().token).toBe('new-token');
    });
  });

  describe('clearAuth', () => {
    it('token, user를 null로, isAuthenticated를 false로 초기화한다', () => {
      useAuthStore.getState().setAuth('jwt-token-123', mockUser);
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('getToken', () => {
    it('setAuth 전에는 null을 반환한다', () => {
      expect(useAuthStore.getState().getToken()).toBeNull();
    });

    it('setAuth 후에는 설정된 토큰을 반환한다', () => {
      useAuthStore.getState().setAuth('my-token', mockUser);
      expect(useAuthStore.getState().getToken()).toBe('my-token');
    });

    it('clearAuth 후에는 null을 반환한다', () => {
      useAuthStore.getState().setAuth('my-token', mockUser);
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().getToken()).toBeNull();
    });
  });

  describe('메모리 전용 저장소', () => {
    it('localStorage를 사용하지 않는다', () => {
      useAuthStore.getState().setAuth('jwt-token-123', mockUser);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('sessionStorage를 사용하지 않는다', () => {
      useAuthStore.getState().setAuth('jwt-token-123', mockUser);
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });
});
