import { INotification } from "../../modules/notifications/notification.interface";
import { Notification } from "../../modules/notifications/notification.model";
import { io } from "../../socket";
 

export const sendEventNotification = async (
  payload: INotification
) => {
  const notification = await Notification.create(payload);

  io.to(`event:${payload.eventId}`).emit("notification", notification);
};
