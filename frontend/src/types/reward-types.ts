export interface Reward {
  id: string;
  userId: string;
  milestone: number;
  tier: 'small' | 'medium' | 'large';
  title: string;
  description: string | null;
  isAchieved: boolean;
  achievedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardRequest {
  milestone: number;
  title: string;
  description?: string | null;
}

export interface UpdateRewardRequest {
  title?: string;
  description?: string | null;
}

export interface RewardProgress {
  completedCount: number;
  rewards: Reward[];
  nextMilestone: number | null;
  progressToNext: number;
}
