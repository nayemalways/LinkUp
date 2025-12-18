/* eslint-disable no-console */
// -------------Chat GPT Code-----------------------
import { StatusCodes } from 'http-status-codes';
import {
  EventStatus,
  IEvent,
  LocationType,
} from '../../modules/events/event.interface';
import Event from '../../modules/events/event.model';
import Group from '../../modules/groups/group.model';
import User from '../../modules/users/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { deleteImageFromCLoudinary } from '../../config/cloudinary.config';
import AppError from '../../errorHelpers/AppError';
import { addressToLongLat } from '../../utils/geocodeConvert.utils';
import FriendRequest from '../friends/friend.model';
import { RequestStatus } from '../friends/friend.interface';
import { sendFriendsNotification } from '../../utils/notificationsendhelper/friends.notification.utils';
import { NotificationType } from '../notifications/notification.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { ICoord, Role } from '../users/user.interface';
import { Types } from 'mongoose';
import Booking from '../booking/booking.model';
import { sendEmail } from '../../utils/sendMail';
import { NotificationPreference } from '../notifications/notification.model';

// CREATE EVENT SERVICE
const createEventService = async (payload: IEvent, user: JwtPayload) => {
  // CHECK USER IS NOT VERIFIED
  if (!user.isVerified) {
    payload.images?.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.FORBIDDEN, 'Please verify your profile!');
  }

  if (!payload.category) {
    payload.images?.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.NOT_FOUND, 'Category must be include!');
  }

  // => Check for duplicate event title
  const existingEvent = await Event.findOne({ title: payload.title });
  if (existingEvent) {
    payload.images?.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'An event already exists with this title!'
    );
  }

  // => -----GET COORDINATES-------
  const addressLine = `${payload?.venue}, ${payload.address.city}, ${payload.address.state}, ${payload.address.postal}, ${payload.address.country}`;
  const coord = await addressToLongLat(addressLine);

  if (!coord.lat || !coord.long) {
    payload.images.forEach((image) => deleteImageFromCLoudinary(image));
    throw new AppError(StatusCodes.BAD_REQUEST, 'Coord is empty');
  }
  const location = {
    type: LocationType.POINT,
    coordinates: [coord.long, coord.lat],
  };

  payload.location = location;
  payload.host = user.userId;

  // => -------Create event & chat group in parallel--------
  const [createEvent, createChatGroup] = await Promise.all([
    Event.create(payload),
    Group.create({
      group_admin: user.userId,
      group_name: `Event: ${payload.title} Chat Group`,
      group_image: payload.images?.[0] || '',
      group_members: [user.userId],
      group_description: `This is the chat group for the event: ${payload.title}`,
    }),
  ]);

  // => FIX CHAT GROUP'S EVENTID AFTER CREATE EVENT RESOLVE <=
  createChatGroup.event = createEvent._id; // Important to add
  await createChatGroup.save();


  // => ========SEND NOTIFICATION ASYNCHRONUSLY (FIRE-AND-FORGET)========= <=
  setImmediate(async () => {
    try {
      // GET - ACCPTED FRIENDS
      const friends = await FriendRequest.find({
        $or: [
          { sender: user.userId, status: RequestStatus.ACCEPTED },
          { receiver: user.userId, status: RequestStatus.ACCEPTED },
        ],
      });

      // GET ONLY FRIENDS ID
      const friendIds = friends.map((fr) =>
        fr.sender.toString() === user.userId ? fr.receiver : fr.sender
      );
      const host = await User.findById(user.userId).select('fullName avatar');

      await sendFriendsNotification({
        title: `Your friend - ${host?.fullName} just created an Event!`,
        type: NotificationType.FRIEND,
        receiverIds: friendIds,
        description: `${createEvent.title} is created. Tap to see details.`,
        data: {
          eventId: createEvent._id.toString(),
          image: host?.avatar || '',
        },
      });
    } catch (err) {
      console.error('Failed to send event notifications:', err);
    }
  })

  // => RETUNR RESPONSE BEFORE SENDING NOTIFICATION
  return { event: createEvent, chatGroup: createChatGroup };
};

// GET EVENTS SERVICE
const getEventsService = async (
  _user: JwtPayload,
  query: Record<string, string>
) => {
  const user = await User.findById(_user.userId);

  // Query Builder
  const qeuryBuilder = new QueryBuilder(Event.find(), query);
  const events = await qeuryBuilder
    .nearby(user?.coord as ICoord)
    .filter()
    .category()
    .textSearch()
    .dateFilter()
    .sort()
    .select()
    .paginate()
    .join()
    .build();

  // Meta data
  const metaData = await qeuryBuilder.getMeta();
  return {
    events,
    metaData,
  };
};

// GET USER INTERESTED EVENTS
const getInterestEventsService = async (
  _user: JwtPayload,
  query: Record<string, string>
) => {
  const user = await User.findById(_user.userId);

  // Query Builder
  const qeuryBuilder = new QueryBuilder(Event.find(), query);
  const events = await qeuryBuilder
    .nearby(user?.coord as ICoord)
    .filter()
    .category()
    .dateFilter()
    .sort()
    .select()
    .interests(user?.interests as Types.ObjectId[])
    .paginate()
    .join()
    .build();

  // Meta data
  const metaData = await qeuryBuilder.getMeta();
  return {
    metaData,
    events,
  };
};

// GET SINGLE EVENT SERVICE
const getEventDetailsService = async (_user: JwtPayload, eventId: string) => {
  if (!eventId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Event id required!');
  }

  const user = await User.findById(_user.userId);
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User not found!');
  }

  const event = await Event.findById(eventId)
    .populate('host')
    .populate('category')
    .populate('co_host');
  if (!event) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'No event found!');
  }

  return event;
};

// UPDATE EVENT SERVICE
const updateEventService = async (
  user: JwtPayload,
  eventId: string,
  payload: Partial<IEvent>
) => {
  const event = await Event.findOne({ _id: eventId, host: user.userId })
    .populate('host')
    .populate('co_host');
  if (!event) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Event not found!');
  }

  // Only Host and Co-host can update event
  if (user.userId !== event?.host?._id.toString() && user.userId !== event?.co_host?._id.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only host and co_host can update event!'
    );
  }

  // OK: Location will automatically updated when  the address and venu will change
  if (payload.location) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can't update location manually!"
    );
  }

  // OK : Only Admin can change featured status
  if (user.role === Role.USER || user.role === Role.ORGANIZER) {
    if (payload.featured) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Only Admin can change featured status!'
      );
    }
  }

  // OK: If user is co-host he can't change himself
  if (user.userId === event?.co_host) {
    if (payload.co_host) {
      throw new AppError(StatusCodes.FORBIDDEN, "You can't change co-host!");
    }
  }

  // OK: Only update event status to complete after the event end!
  if (payload.event_status === EventStatus.COMPLETED) {
    if (event.event_end < new Date()) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        `You can't update event status to "${payload.event_status}" before the event end! Check end time!`
      );
    }
  }

  if (payload.event_status === EventStatus.CANCELLED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can't cancel an event before refund attendenced money!"
    );
  }

  // ========= Image Update and Deletation from cloudinary ==================
  if (
    payload.images &&
    payload.images.length > 0 &&
    event.images &&
    event.images.length > 0
  ) {
    /**
     * DB already has images:
     *   event.images = [img1, img2, img3, img4]
     *
     * Frontend sends new images:
     *   payload.images = [img5, img6]
     *
     * Merge existing DB images with newly uploaded images.
     * Use Set to avoid duplicate image entries.
     *
     * Result:
     *   payload.images = [img1, img2, img3, img4, img5, img6]
     */
    payload.images = [...new Set([...payload.images, ...event.images])];
  }

  if (
    payload.deletedImages &&
    payload.deletedImages.length > 0 &&
    event.images &&
    event.images.length > 0
  ) {
    /**
     * Images user wants to delete:
     *   payload.deletedImages = [img2, img3]
     */

    /**
     * Step 1:
     * Remove deleted images from existing DB images.
     *
     * DB images before:
     *   event.images = [img1, img2, img3, img4]
     *
     * DB images after filtering:
     *   restDBImage = [img1, img4]
     *
     * These images remain unchanged in the database.
     */
    const restDBImage = event.images.filter(
      (image) => !payload.deletedImages?.includes(image)
    );

    /**
     * Step 2:
     * Remove deleted images from the merged payload images.
     *
     * Merged payload images:
     *   payload.images = [img1, img2, img3, img4, img5, img6]
     *
     * After filtering deleted images:
     *   updatePayloadImages = [img1, img4, img5, img6]
     *
     * These are the final images that should be saved/updated.
     */
    const updatePayloadImages = (payload.images || []).filter(
      (image) => !payload.deletedImages?.includes(image)
    );

    /**
     * Step 3:
     * Merge remaining DB images with updated payload images.
     * Use Set again to ensure no duplicates.
     *
     * Final result saved to DB:
     *   payload.images = [img1, img4, img5, img6]
     */
    payload.images = [...new Set([...restDBImage, ...updatePayloadImages])];
  }

  // =======UPDATE EVENT=======
  const updateEvent = await Event.findByIdAndUpdate(eventId, payload, {
    new: true,
    runValidators: true,
  });

  // =======DELETE IMAGES FROM CLOUDINARY (ASYNCHRONOUSLY)===============
  (async () => {
    try {
      if (
        payload?.deletedImages &&
        payload?.deletedImages.length > 0 &&
        event.images &&
        event.images.length > 0
      ) {
        await Promise.all(
          payload?.deletedImages.map((url) => deleteImageFromCLoudinary(url))
        );
      }
    } catch (error) {
      console.log(`Notification sending error`, error);
    }
  })();

  // ===========SEND NOTIFICATION (ASYNCHRONOUSLY)===============
  (async () => {
    // GET BOOKED USERS
    const eventBooking = await Booking.find({
      event: eventId,
    }).select('user').populate('user', "fullName email fcmToken").lean();
    
    // FILTER ONLY BOOKED MEMBERS
    const bookedMembersInfo = eventBooking.map((booking) => booking?.user);
    
    try {
      if (payload?.title) {
         bookedMembersInfo.forEach(async (member) => {
          const notificationPreference = await NotificationPreference.findOne({user: member._id });

          if(notificationPreference?.channel?.email) {
            console.log("send mail process..")
            sendEmail({
              to: "nayemalways.sm@gmail.com",
              subject: "Your event title has changed!",
              templateName: "eventUpdate",
            })
            console.log("send mail finsihed")
          }
          
         })
      }
    } catch (error) {
      console.log(`Notification sending error`, error);
    }
  })();

  // RETURN UPDATE RESULT
  return updateEvent;
};

// EXPORT ALL SERVICES FUNCTION
export const eventServices = {
  createEventService,
  getEventsService,
  getEventDetailsService,
  getInterestEventsService,
  updateEventService,
};
