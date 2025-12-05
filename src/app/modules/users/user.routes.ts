import express from 'express';
import { userControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userZodSchema } from './user.validate';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from './user.interface';

const router = express.Router();

router.post(
  '/registration',
  validateRequest(userZodSchema),
  userControllers.registerUser
);

router.get('/get_me', checkAuth(...Object.keys(Role)), userControllers.getMe);
router.patch('/:userId', checkAuth(...Object.keys(Role)), userControllers.userUpdate);

router.get(
  '/verify/:otp',
  validateRequest(userZodSchema),
  userControllers.verifyUser
);
router.get('/resend-otp', userControllers.resendOTP);

export const userRoutes = router;
