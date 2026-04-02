import { Router } from 'express';
import authRoutes from './auth-routes';
import todoRoutes from './todo-routes';
import rewardRoutes from './reward-routes';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/todos', todoRoutes);
router.use('/api/rewards', rewardRoutes);

export { router };
