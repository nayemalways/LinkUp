import { Notification } from "../../modules/notifications/notification.model";
import { io } from "../../socket";
import { NotificationPayload } from "./user.notification.utils";


export const sendGlobalNotification = async (
  payload: NotificationPayload
) => {
  const notification = await Notification.create({
    type: "global",
    title: payload.title,
    message: payload.message,
  });

  io.emit("notification", notification);
};
