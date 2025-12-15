/* eslint-disable no-console */
// -------------Chat GPT Code-----------------------
import { StatusCodes } from "http-status-codes";
import { IEvent } from "../../modules/events/event.interface";
import Event from "../../modules/events/event.model";
import Group from "../../modules/groups/group.model";
import User from "../../modules/users/user.model";
import { JwtPayload } from "jsonwebtoken";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { addressToLongLat } from "../../utils/geocodeConvert.utils";
import FriendRequest from "../friends/friend.model";
import { RequestStatus } from "../friends/friend.interface";
import { sendFriendsNotification } from "../../utils/notificationsendhelper/friends.notification.utils";
import { NotificationType } from "../notifications/notification.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";


// CREATE EVENT SERVICE
const createEventService = async (payload: IEvent, user: JwtPayload) => {
  // If host is not verified
  if (!user.isVerified) {
    payload.images?.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.FORBIDDEN, "Please verify your profile!");
  }

  // => Check for duplicate event title
  const existingEvent = await Event.findOne({ title: payload.title });
  if (existingEvent) {
    payload.images?.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.BAD_REQUEST, "An event already exists with this title!");
  }

  // => -----Geocode address-------
  const addressLine = `${payload?.venue}, ${payload.address.city}, ${payload.address.state}, ${payload.address.postal}, ${payload.address.country}`;
  const coord = await addressToLongLat(addressLine);

  if (!coord.lat || !coord.long) {
    payload.images.forEach(image => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.BAD_REQUEST, "Coord is empty");
  }
 
  payload.coord = coord;
  payload.host = user.userId;

  // => -------Create event & chat group in parallel--------
  const [createEvent, createChatGroup] = await Promise.all([
    Event.create(payload),
    Group.create({
      group_admin: user.userId,
      group_name: `Event: ${payload.title} Chat Group`,
      group_image: payload.images?.[0] || "",
      group_members: [user.userId],
      group_description: `This is the chat group for the event: ${payload.title}`,
    }),
  ]);

  // => Fix chat group's event ID after createEvent resolves <=
  createChatGroup.event = createEvent._id; // Important to add
  await createChatGroup.save();

  // => Send notifications asynchronously (fire-and-forget) <=
  (async () => {
    try {
      // Get -request accepted friends
      const friends = await FriendRequest.find({
        $or: [
          { sender: user.userId, status: RequestStatus.ACCEPTED },
          { receiver: user.userId, status: RequestStatus.ACCEPTED },
        ],
      });

      const friendIds = friends.map(fr => (fr.sender.toString() === user.userId ? fr.receiver : fr.sender));
      const host = await User.findById(user.userId).select("fullName avatar");

      await sendFriendsNotification({
        title: `Your friend - ${host?.fullName} just created an Event!`,
        type: NotificationType.FRIEND,
        receiverIds: friendIds,
        description: `${createEvent.title} is created. Tap to see details.`,
        data: {
          eventId: createEvent._id,
          image: host?.avatar || "",
        },
      });
    } catch (err) {
      console.error("Failed to send event notifications:", err);
    }
  })();

  // => Return response immediately
  return { event: createEvent, chatGroup: createChatGroup };
};

// GET EVENTS SERVICE
const getEventsService = async (query: Record<string, string>) => {
 
  const qeuryBuilder = new QueryBuilder(Event.find(), query);
  return await qeuryBuilder
                                    .filter()
                                    .textSearch()
                                    .sort()
                                    .select()
                                    .paginate()
                                    .join().build();
}


export const eventServices = {
  createEventService,
  getEventsService
};
