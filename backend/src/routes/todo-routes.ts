import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import * as todoController from '../controllers/todo-controller';

const router = Router();

router.use(authMiddleware);

router.post('/', todoController.createTodo);
router.get('/', todoController.getTodos);
router.get('/:id', todoController.getTodoById);
router.put('/:id', todoController.updateTodo);
router.patch('/:id/complete', todoController.completeTodo);
router.patch('/:id/incomplete', todoController.incompleteTodo);
router.delete('/:id', todoController.deleteTodo);

export default router;
