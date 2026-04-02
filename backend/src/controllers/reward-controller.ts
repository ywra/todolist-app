import { Request, Response, NextFunction } from 'express';
import * as rewardService from '../services/reward-service';

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const progress = await rewardService.getRewardProgress((req as any).user.userId);
    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
}

export async function createReward(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reward = await rewardService.createReward((req as any).user.userId, req.body);
    res.status(201).json({ success: true, data: reward });
  } catch (err) {
    next(err);
  }
}

export async function updateReward(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reward = await rewardService.updateReward(
      (req as any).user.userId,
      req.params['id'] as string,
      req.body,
    );
    res.status(200).json({ success: true, data: reward });
  } catch (err) {
    next(err);
  }
}
