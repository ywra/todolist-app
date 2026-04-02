import '@testing-library/jest-dom';
import { useLocaleStore } from '@/stores/locale-store';
import { beforeEach } from 'vitest';

// 테스트 환경에서 locale을 항상 'ko'로 초기화
// (navigator.language가 'en'으로 설정되어 있어 기본값이 'en'이 되는 것을 방지)
beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' });
});
