import { Router } from 'express';
import { authController } from './auth.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';
import { validateRequest } from '../../middlewares/validateRequest';
import { passwordZodSchema } from '../users/user.validate';


const router = Router();

router.post('/login', authController.credentialsLogin);
router.post('/refresh', authController.getNeAccessToken);
router.post('/chnage-password', checkAuth(...Object.keys(Role)), authController.changePassword);
router.get('/forget-password/:email', authController.forgetPassword);
router.get('/verify_reset_password_otp/:email/:otp', authController.verifyOTP);
router.post('/reset-password', validateRequest(passwordZodSchema), authController.resetPassword);


export const authRouter = router;
