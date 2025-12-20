/* eslint-disable no-console */
import admin from "../../config/firebase.config";
import { INotification } from "../../modules/notifications/notification.interface";
import { Notification } from "../../modules/notifications/notification.model";
import User from "../../modules/users/user.model";


export const sendPushAndSave = async (payload: INotification) => {
  try {
    const user = await User.findById(payload.user);
    if (!user || !user.fcmToken) return;

    // Save in MongoDB
    const notification = await Notification.create({ ...payload });

    // Send push notification
      const message = {
      token: user.fcmToken,
      notification: {
        title: payload.title,
        body: payload.description,
      },
      data: payload.data || {}, // optional key-value pairs
    };


    await admin.messaging().send(message); // Send notificaton via FCM
    return notification;
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};
