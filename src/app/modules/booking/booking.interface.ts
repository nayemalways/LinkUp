import { Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface IBooking {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  payment?: Types.ObjectId;
  booking_status: string;
}
