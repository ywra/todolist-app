import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import * as rewardController from '../controllers/reward-controller';

const router = Router();

router.get('/', authMiddleware, rewardController.getProgress);
router.post('/', authMiddleware, rewardController.createReward);
router.put('/:id', authMiddleware, rewardController.updateReward);

export default router;
