import { Types } from "mongoose";
import { INotification } from "../../modules/notifications/notification.interface";
import { Notification } from "../../modules/notifications/notification.model";
import { io } from "../../socket";


 
export const sendPersonalNotification = async ( payload: INotification ) => {
  // Save to DB (for offline support)
  const notification = await Notification.create(payload);

  // Send real-time
  io.to((payload.user as Types.ObjectId).toString()).emit("notification", notification);
};
