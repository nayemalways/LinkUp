import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { INotificationPreference } from './notification.interface';
import { NotificationPreference } from './notification.model';

// Get user's notification preferences (using)
const getUserNotificationPreferences = async (userId: string) => {
  const preferences = await NotificationPreference.findOne({ user: userId });

  if (!preferences) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification preferences not found'
    );
  }

  return preferences;
};

// Update notification preferences (using)
const updateNotificationPreferences = async (
  userId: string,
  payload: Partial<INotificationPreference>
) => {
  const preferences = await NotificationPreference.findOne({ user: userId });

  if (!preferences) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification preferences not found'
    );
  }

  const updatedPreferences = await NotificationPreference.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, runValidators: true }
  );

  return updatedPreferences;
};

export const NotificationService = {
  getUserNotificationPreferences,
  updateNotificationPreferences,
};
