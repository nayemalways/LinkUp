import httpStatus from 'http-status-codes';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import AppError from '../../errorHelpers/AppError';
import { NotificationService } from './notification.service';
import { JwtPayload } from 'jsonwebtoken';

// Get user's notification preferences (using)
const getUserNotificationPreferences = CatchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user?.userId;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');

  const result =
    await NotificationService.getUserNotificationPreferences(userId);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification preferences retrieved successfully',
    data: result,
  });
});

// Update notification preferences (bulk update) (using)
const updateNotificationPreferences = CatchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user?.userId;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  const payload = req.body;

  const result = await NotificationService.updateNotificationPreferences(
    userId,
    payload
  );

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification preferences updated successfully',
    data: result,
  });
});

export const NotificationController = {
  getUserNotificationPreferences,
  updateNotificationPreferences,
};
