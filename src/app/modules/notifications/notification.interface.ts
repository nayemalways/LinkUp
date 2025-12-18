/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export enum NotificationType {
   CHAT = "CHAT",
   FRIEND = "FRIEND",
   EVENT = "EVENT",
   SYSTEM = "SYSTEM"
}

export enum NotificationCategory {
  SYSTEM = 'system',
  EVENT_UPDATE = 'event_update',
  BOOKING_UPDATE = 'booking_update',
  MESSAGE = 'message',
  FRIEND_REQUEST = 'friend_request',
  MARKETING = 'marketing',
}

export interface IChannel {
  push: boolean;
  email: boolean;
  inApp: boolean;
}


export interface INotification {
  _id?: Types.ObjectId;
  user?: Types.ObjectId;
  eventId?: Types.ObjectId,
  chatId?: Types.ObjectId,
  receiverIds?: Types.ObjectId[];
  type: NotificationType
  title: string;
  description?: string;
  data?: Record<string, any>;
  isRead?: boolean;               
}

export interface INotificationPreference {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  channel: IChannel;
  category: NotificationCategory;
}

