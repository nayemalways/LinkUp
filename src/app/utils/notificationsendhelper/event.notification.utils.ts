import { Notification } from "../../modules/notifications/notification.model";
import { io } from "../../socket";
import { NotificationPayload } from "./user.notification.utils";

export const sendEventNotification = async (
  eventId: string,
  payload: NotificationPayload
) => {
  const notification = await Notification.create({
    type: "event",
    eventId,
    title: payload.title,
    message: payload.message,
  });

  io.to(`event:${eventId}`).emit("notification", notification);
};
