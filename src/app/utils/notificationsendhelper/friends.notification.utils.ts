import admin from '../../config/firebase.config';
import {
  Notification,
  NotificationPreference,
} from '../../modules/notifications/notification.model';
import { io, onlineUsers } from '../../socket';
import { Types } from 'mongoose';
import { INotification } from '../../modules/notifications/notification.interface';
import User from '../../modules/users/user.model';

export const sendMultiNotification = async (payload: INotification) => {
  // Save notification in DB
  const notification = await Notification.create(payload);

  // GET ONLINE/OFFLINE FRIENDS
  const onlineFriends: string[] = [];
  const offlineFriendIds: Types.ObjectId[] = [];

  // FILTER ONLINE/OFFLINE FRIENDS
  (payload.receiverIds as Types.ObjectId[]).forEach(async (friendId) => {
    const friendIdStr = friendId.toString();
    if (onlineUsers[friendIdStr]) {
      const notificationPreference = await NotificationPreference.findOne({
        user: friendId,
      });

      if (notificationPreference?.channel.inApp) {
        io.to(friendIdStr).emit('notification', notification); // Online
      }
      onlineFriends.push(friendIdStr);
    } else {
      offlineFriendIds.push(friendId);
    }
  });

  // FETCH FCM TOKENS FOR OFFLINE FRIENDS
  if (offlineFriendIds.length > 0) {
    // FILTER ONLY PUSH NOTIFICATION ALLOWED USER
    const notificationPreference = await NotificationPreference.find({
      user: { $in: offlineFriendIds },
    });

    const usersAllowedPush: string[] = [];
    notificationPreference.forEach((userNotificationPref) => {
      if (userNotificationPref.channel.push) {
        usersAllowedPush.push(userNotificationPref?.user.toString());
      }
    });

    const users = await User.find({ _id: { $in: usersAllowedPush } }).select(
      'fcmToken'
    );
    const allTokens = users.flatMap((u) => u.fcmToken); // flatten for multi-device

    // SEND PUSH NOTIFICATIONS IN PARALLEL BATCHES
    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < allTokens.length; i += batchSize) {
      batches.push(allTokens.slice(i, i + batchSize));
    }

    // SEND MULTIPLE NOTIFICATION
    const formattedData: Record<string, string> = {};
    if (notification.data) {
      for (const [key, val] of Object.entries(notification.data)) {
        if (val !== undefined && val !== null) {
          formattedData[key] = String(val);
        }
      }
    }

    try {
      await Promise.all(
        batches.map((batchTokens) =>
          admin.messaging().sendEachForMulticast({
            tokens: batchTokens as string[],
            notification: {
              title: notification.title,
              body: notification.description || '',
            },
            data: formattedData,
          })
        )
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error sending multicast notification:', err);
    }
  }

  return notification;
};
