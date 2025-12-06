import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

router.post('/login', authController.credentialsLogin);
router.post('/refresh', authController.getNeAccessToken);

export const authRouter = router;
