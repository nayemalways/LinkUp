import { Router } from 'express';
import { authController } from './auth.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = Router();

router.post('/login', authController.credentialsLogin);
router.post('/refresh', authController.getNeAccessToken);
router.post('/chnage-password', checkAuth(...Object.keys(Role)), authController.changePassword);

export const authRouter = router;
