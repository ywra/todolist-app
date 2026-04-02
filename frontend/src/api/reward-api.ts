import apiClient from './client';
import type { ApiResponse } from '@/types/api-types';
import type {
  Reward,
  RewardProgress,
  CreateRewardRequest,
  UpdateRewardRequest,
} from '@/types/reward-types';

export const getRewardProgress = async (): Promise<ApiResponse<RewardProgress>> => {
  const response = await apiClient.get<ApiResponse<RewardProgress>>('/rewards');
  return response.data;
};

export const createReward = async (
  data: CreateRewardRequest,
): Promise<ApiResponse<Reward>> => {
  const response = await apiClient.post<ApiResponse<Reward>>('/rewards', data);
  return response.data;
};

export const updateReward = async (
  id: string,
  data: UpdateRewardRequest,
): Promise<ApiResponse<Reward>> => {
  const response = await apiClient.put<ApiResponse<Reward>>(`/rewards/${id}`, data);
  return response.data;
};
