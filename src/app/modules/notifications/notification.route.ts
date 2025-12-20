import express from 'express';
import { NotificationController } from './notification.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validate';

const router = express.Router();

// Get user's notification preferences
router.get(
  '/preferences',
  checkAuth(),
  NotificationController.getUserNotificationPreferences
);

// Update notification preferences (bulk update)
router.patch(
  '/preferences',
  checkAuth(),
  validateRequest(NotificationValidation.updateNotificationPreferencesSchema),
  NotificationController.updateNotificationPreferences
);

export const notificationRouter = router;
