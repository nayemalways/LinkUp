import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import Booking from '../booking/booking.model';
import Review from './review.model';
import Event from '../events/event.model';

interface CreateReviewInput {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  vote: 'UP' | 'DOWN';
  comment?: string;
}

export const createReviewService = async ({
  userId,
  eventId,
  vote,
  comment,
}: CreateReviewInput) => {
  // 1. Fetch event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // 2. Ensure event completed
  if (new Date() < new Date(event.event_end)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Reviews are allowed only after event completion'
    );
  }

  // 3. Prevent organizer/host from reviewing their own event
  if (event.host.toString() === userId.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Event host cannot review their own event'
    );
  }

  // 4. Ensure user is a confirmed attendee
  const booking = await Booking.findOne({
    event: eventId,
    user: userId,
    booking_status: 'CONFIRMED',
  });

  if (!booking) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only confirmed attendees can review this event'
    );
  }

  // 5. Prevent duplicate review
  const existingReview = await Review.findOne({
    event: eventId,
    user: userId,
    isDeleted: false,
  });

  if (existingReview) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'You have already reviewed this event'
    );
  }

  // 6. Create review
  const review = await Review.create({
    user: userId,
    event: eventId,
    host: event.host,
    vote,
    comment,
  });

  return review;
};
