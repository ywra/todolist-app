import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRewardProgress,
  createReward,
  updateReward,
} from '@/api/reward-api';
import type { CreateRewardRequest, UpdateRewardRequest } from '@/types/reward-types';

export function useRewardProgress() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: () => getRewardProgress(),
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRewardRequest) => createReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRewardRequest }) =>
      updateReward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}
