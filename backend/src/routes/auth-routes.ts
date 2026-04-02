import { Router } from 'express';
import * as authController from '../controllers/auth-controller';
import { authMiddleware } from '../middlewares/auth-middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/profile/password', authMiddleware, authController.changePassword);

export default router;
