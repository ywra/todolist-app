import * as rewardRepository from '../repositories/reward-repository';
import { AppError, ERROR_CODES } from '../utils/error-utils';
import {
  Reward,
  CreateRewardRequest,
  UpdateRewardRequest,
  RewardProgress,
} from '../types/reward-types';

const VALID_MILESTONES = [10, 30, 100] as const;
type ValidMilestone = (typeof VALID_MILESTONES)[number];

const MILESTONE_TIER_MAP: Record<ValidMilestone, Reward['tier']> = {
  10: 'small',
  30: 'medium',
  100: 'large',
};

function isValidMilestone(value: number): value is ValidMilestone {
  return (VALID_MILESTONES as readonly number[]).includes(value);
}

function computeNextMilestone(completedCount: number): number | null {
  for (const ms of VALID_MILESTONES) {
    if (completedCount < ms) {
      return ms;
    }
  }
  return null;
}

export async function getRewardProgress(userId: string): Promise<RewardProgress> {
  const completedCount = await rewardRepository.getCompletedCount(userId);
  const rewards = await rewardRepository.findByUserId(userId);

  // 달성 조건을 충족하지만 아직 달성 처리되지 않은 보상 자동 처리
  for (const reward of rewards) {
    if (!reward.isAchieved && completedCount >= reward.milestone) {
      const updated = await rewardRepository.markAchieved(reward.id);
      const idx = rewards.indexOf(reward);
      rewards[idx] = updated;
    }
  }

  const nextMilestone = computeNextMilestone(completedCount);
  const progressToNext = nextMilestone !== null ? nextMilestone - completedCount : 0;

  return {
    completedCount,
    rewards,
    nextMilestone,
    progressToNext,
  };
}

export async function createReward(
  userId: string,
  data: CreateRewardRequest,
): Promise<Reward> {
  const { milestone, title, description } = data;

  if (!isValidMilestone(milestone)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '마일스톤은 10, 30, 100 중 하나여야 합니다.',
    );
  }

  if (!title || title.trim().length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '보상 제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
    );
  }

  if (title.length > 200) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '보상 제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
    );
  }

  if (description !== undefined && description !== null && description.length > 2000) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '보상 설명은 최대 2,000자까지 입력할 수 있습니다.',
    );
  }

  const existing = await rewardRepository.findByUserIdAndMilestone(userId, milestone);
  if (existing) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `마일스톤 ${milestone}에 대한 보상이 이미 존재합니다.`,
    );
  }

  const tier = MILESTONE_TIER_MAP[milestone];
  return rewardRepository.create(userId, milestone, tier, title.trim(), description);
}

export async function updateReward(
  userId: string,
  rewardId: string,
  data: UpdateRewardRequest,
): Promise<Reward> {
  const rewards = await rewardRepository.findByUserId(userId);
  const target = rewards.find((r) => r.id === rewardId);

  if (!target) {
    throw new AppError(ERROR_CODES.NOT_FOUND, '보상을 찾을 수 없습니다.');
  }

  if (target.userId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, '해당 보상에 접근할 권한이 없습니다.');
  }

  const { title, description } = data;

  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '보상 제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
      );
    }
    if (title.length > 200) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        '보상 제목은 1자 이상 200자 이하이며, 공백만으로 구성될 수 없습니다.',
      );
    }
  }

  if (description !== undefined && description !== null && description.length > 2000) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '보상 설명은 최대 2,000자까지 입력할 수 있습니다.',
    );
  }

  return rewardRepository.update(rewardId, title?.trim(), description);
}

export async function checkAndAwardRewards(userId: string): Promise<Reward[]> {
  const completedCount = await rewardRepository.getCompletedCount(userId);
  const rewards = await rewardRepository.findByUserId(userId);

  const newlyAchieved: Reward[] = [];

  for (const reward of rewards) {
    if (!reward.isAchieved && completedCount >= reward.milestone) {
      const updated = await rewardRepository.markAchieved(reward.id);
      newlyAchieved.push(updated);
    }
  }

  return newlyAchieved;
}
