import { NotificationType } from "../../modules/notifications/notification.interface";
import { Notification } from "../../modules/notifications/notification.model";
import { io } from "../../socket";


export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType
};

export const sendPersonalNotification = async (
  receiverUserId: string,
  payload: NotificationPayload
) => {

  // Save to DB (for offline support)
  const notification = await Notification.create({
    type:  payload.type,
    userId: receiverUserId,
    title: payload.title,
    message: payload.message,
  });

  // Send real-time
  io.to(receiverUserId).emit("notification", notification);
};
