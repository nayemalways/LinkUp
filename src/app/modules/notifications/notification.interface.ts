/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export enum NotificationType {
  SYSTEM_UPDATE = 'system_update',
  PROMO_OFFER = 'promo_offer',
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED = 'event_cancelled',
  EVENT_REMINDER = 'event_reminder',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  TICKET_REFUND = 'ticket_refund',
  MESSAGE_RECEIVED = 'message_received',
  COMMENT_REPLY = 'comment_reply',
  FOLLOWER_EVENT = 'follower_event',
  FRIEND_JOINED_EVENT = 'friend_joined_event',
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
  id?: Types.ObjectId;
  user?: Types.ObjectId[]; // user/users
  type: NotificationType;
  title: string;
  description?: string;
  isRead?: boolean;
  data?: any;
}

export interface INotificationPreference {
  id?: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  channel: IChannel;
  category: NotificationCategory;
}
