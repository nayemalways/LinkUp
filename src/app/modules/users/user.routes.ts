import express from 'express';
import { userControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userUpdateZodSchema, userZodSchema } from './user.validate';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from './user.interface';
import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.post('/registration', validateRequest(userZodSchema), userControllers.registerUser);
router.get('/get_me', checkAuth(...Object.keys(Role)), userControllers.getMe);
router.get('/profile/:userId', checkAuth(...Object.keys(Role)), userControllers.getProfile);
router.get('/', checkAuth(...Object.values(Role)),  userControllers.getAllUser);
router.patch('/:userId', checkAuth(...Object.keys(Role)), multerUpload.single('file'), validateRequest(userUpdateZodSchema),  userControllers.userUpdate);
router.delete('/:userId', checkAuth(...Object.keys(Role)), userControllers.userDelete);

router.get('/verify/:otp', validateRequest(userZodSchema), userControllers.verifyUser);
router.get('/resend-otp', userControllers.resendOTP);

export const userRoutes = router;
