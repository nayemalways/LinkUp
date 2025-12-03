import express from 'express';
import { userControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userZodSchema } from './user.validate';

const router = express.Router();

router.post('/create', validateRequest(userZodSchema), userControllers.createUser);
router.get('/verify/:otp', validateRequest(userZodSchema), userControllers.verifyUser);
router.get('/resend-otp', userControllers.resendOTP);


export const userRoutes = router;