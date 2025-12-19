import admin from "firebase-admin";
import { Notification } from "../../modules/notifications/notification.model";
import { io, onlineUsers } from "../../socket";
import { Types } from "mongoose";
import { INotification } from "../../modules/notifications/notification.interface";
import User from "../../modules/users/user.model";

export const sendMultiNotification = async (payload: INotification) => {
  // Save notification in DB
  const notification = await Notification.create(payload);
  
  // GET ONLINE/OFFLINE FRIENDS
  const onlineFriends: string[] = [];
  const offlineFriendIds: Types.ObjectId[] = [];


  // FILTER ONLIN/OFFLINE FRIENDS
  (payload.receiverIds as Types.ObjectId[]).forEach(friendId => {
    const friendIdStr = friendId.toString();
    if (onlineUsers[friendIdStr]) {
      io.to(friendIdStr).emit("notification", notification); // Online
      onlineFriends.push(friendIdStr);
    } else {
      offlineFriendIds.push(friendId);
    }
  });

  // FETCH FCM TOKENS FOR OFFLINE FRIENDS
  if (offlineFriendIds.length > 0) {
    const users = await User.find({ _id: { $in: offlineFriendIds } }).select("fcmToken");
    const allTokens = users.flatMap(u => u.fcmToken); // flatten for multi-device

    // SEND PUSH NOTIFICATIONS IN PARALLEL BATCHES
    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < allTokens.length; i += batchSize) {
      batches.push(allTokens.slice(i, i + batchSize));
    }

  
    // SEND MULTIPLE NOTIFICATION
    await Promise.all(
      batches.map(batchTokens =>
        admin.messaging().sendEachForMulticast({
          tokens: batchTokens as string[],
          notification: { title: notification.title, body: notification.description || "" },
          data: notification.data,
        })
      )
    );
  }

  return notification;
};
