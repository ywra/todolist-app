import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RewardPage from '../RewardPage';

vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ logout: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; user: null }) => unknown) =>
    selector({ isAuthenticated: true, user: null }),
}));

const mockUseRewardProgress = vi.fn();
const mockUseCreateReward = vi.fn();
const mockUseUpdateReward = vi.fn();

vi.mock('@/hooks/useRewards', () => ({
  useRewardProgress: () => mockUseRewardProgress(),
  useCreateReward: () => mockUseCreateReward(),
  useUpdateReward: () => mockUseUpdateReward(),
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/rewards']}>
        <RewardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const defaultProgress = {
  completedCount: 7,
  rewards: [],
  nextMilestone: 10,
  progressToNext: 3,
};

const defaultMutationResult = {
  mutate: vi.fn(),
  isPending: false,
};

describe('RewardPage', () => {
  beforeEach(() => {
    mockUseCreateReward.mockReturnValue(defaultMutationResult);
    mockUseUpdateReward.mockReturnValue(defaultMutationResult);
  });

  it('페이지 제목 "보상 현황"이 렌더링된다', () => {
    mockUseRewardProgress.mockReturnValue({
      data: { data: defaultProgress, success: true },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByRole('heading', { name: '보상 현황' })).toBeInTheDocument();
  });

  it('isLoading이 true일 때 로딩 메시지가 표시된다', () => {
    mockUseRewardProgress.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('보상 카드 3개가 렌더링된다', () => {
    mockUseRewardProgress.mockReturnValue({
      data: { data: defaultProgress, success: true },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('작은 보상')).toBeInTheDocument();
    expect(screen.getByText('중간 보상')).toBeInTheDocument();
    expect(screen.getByText('큰 보상')).toBeInTheDocument();
  });

  it('완료 수와 다음 목표가 표시된다', () => {
    mockUseRewardProgress.mockReturnValue({
      data: { data: defaultProgress, success: true },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('완료한 할일')).toBeInTheDocument();
    expect(screen.getByText('3개 남음')).toBeInTheDocument();
  });

  it('보상 미설정 상태가 표시된다', () => {
    mockUseRewardProgress.mockReturnValue({
      data: { data: defaultProgress, success: true },
      isLoading: false,
    });
    renderPage();
    const notSetElements = screen.getAllByText('보상 미설정');
    expect(notSetElements.length).toBeGreaterThan(0);
  });

  it('달성된 보상은 "달성!" 뱃지가 표시된다', () => {
    const progressWithAchieved = {
      ...defaultProgress,
      completedCount: 15,
      rewards: [
        {
          id: '1',
          userId: 'u1',
          milestone: 10,
          tier: 'small' as const,
          title: '치킨 먹기',
          description: null,
          isAchieved: true,
          achievedAt: '2026-04-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-04-01T00:00:00Z',
        },
      ],
      nextMilestone: 30,
      progressToNext: 15,
    };
    mockUseRewardProgress.mockReturnValue({
      data: { data: progressWithAchieved, success: true },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('치킨 먹기')).toBeInTheDocument();
    expect(screen.getByText(/달성!/)).toBeInTheDocument();
  });
});
