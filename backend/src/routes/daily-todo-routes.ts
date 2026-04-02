import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import * as dailyTodoController from '../controllers/daily-todo-controller';

const router = Router();

router.get('/', authMiddleware, dailyTodoController.getDailyTodos);
router.post('/', authMiddleware, dailyTodoController.createDailyTodo);
router.get('/calendar', authMiddleware, dailyTodoController.getCalendarData);
router.patch('/:id/complete', authMiddleware, dailyTodoController.completeDailyTodo);
router.patch('/:id/incomplete', authMiddleware, dailyTodoController.incompleteDailyTodo);
router.delete('/:id', authMiddleware, dailyTodoController.deleteDailyTodo);

export default router;
