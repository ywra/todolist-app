export interface Reward {
  id: string;
  userId: string;
  milestone: number;
  tier: 'small' | 'medium' | 'large';
  title: string;
  description: string | null;
  isAchieved: boolean;
  achievedAt: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRewardRequest {
  milestone: number; // 10, 30, 100
  title: string;
  description?: string | null;
}

export interface UpdateRewardRequest {
  title?: string;
  description?: string | null;
}

export interface RewardProgress {
  completedCount: number;       // 현재 완료된 총 할일 수
  rewards: Reward[];            // 보상 목록 (최대 3개)
  nextMilestone: number | null; // 다음 마일스톤 (10, 30, 100, 또는 null=모두 달성)
  progressToNext: number;       // 다음 마일스톤까지 남은 수
}
