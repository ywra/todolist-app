import { Router } from 'express';
import authRoutes from './auth-routes';
import todoRoutes from './todo-routes';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/todos', todoRoutes);

export { router };
