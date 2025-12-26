import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../config/stripe.config';
import AppError from '../../errorHelpers/AppError';
import Event, { EventJoinRequest } from '../events/event.model';
import { BookingStatus, IBooking } from './booking.interface';
import User from '../users/user.model';
import Booking from './booking.model';
import Payment from '../payments/payment.model';
import { generateTransactionId } from '../../utils/generateTransactionId';
import { PaymentStatus } from '../payments/payment.interface';
import { EventJoinRequestType, EventVisibility } from '../events/event.interface';
import Stripe from 'stripe';



const bookingIntentService = async (payload: Partial<IBooking>, userId: string) => {

  if (!payload.event) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Event id must required!");
  }

  const isEventExist = await Event.findOne({ _id: payload.event });
  if (!isEventExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No event found!');
  }
  
  
  const isUser = await User.findOne({ _id: userId });
  if (!isUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No user found!');
  }

  if (!isUser.isVerified) {
    throw new AppError(StatusCodes.FORBIDDEN, "Please verify your profile!");
  }
  
  // CHECK USER IS ALREADY IN EVENT
  const isAlreadyBooked = await Booking.findOne({ user: userId, event: payload.event, booking_status: BookingStatus.CONFIRMED});
  
  if (isAlreadyBooked) {
    throw new AppError(StatusCodes.CONFLICT, "You already joined this event! Go to my booking.")
  }
  
  // CHECK HOST HAS STRPE PAYOUTS REGISTERED
  const hostPayoutAccount = await User.findOne({ _id: isEventExist.host });
  if (!hostPayoutAccount?.stripeAccountId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Host hasn't registered payouts!"
    );
  }


  // // IF PRIVATE EVENT: CHECK USER HAS APPROVAL
  if (isEventExist.visibility === EventVisibility.PRIVATE) {
      const  joinEventRequestApproval = await EventJoinRequest.findOne({ user: userId, event: payload.event, approval: EventJoinRequestType.APPROVED });

      if (!joinEventRequestApproval) {
        throw new AppError(StatusCodes.FORBIDDEN, "You can't join private event before approval!");
      }
  }
   
  

  // Initializing Booking
  const booking = await Booking.create({
    event: isEventExist._id,
    user: isUser._id,
    price: isEventExist.price,
    booking_status: BookingStatus.PENDING
  });

  const payment = await Payment.create({
    booking: booking._id,
    transaction_amount: isEventExist.price,
    transaction_id: generateTransactionId(),
    payment_status: PaymentStatus.PENDING
   });

  // Update payment reference
  booking.payment = payment._id;
  await booking.save();


  // PREPARE THE PAYMENT DATA
  const paymentIntentData: Stripe.PaymentIntentCreateParams = {
    amount: Number(isEventExist.price * 100), // cents
    currency: 'usd',
    metadata: {
      payment: payment._id.toString(),
      booking: booking._id.toString(),
      transaction_id: payment.transaction_id
    }, 
    setup_future_usage: 'off_session',
    transfer_data: {
      destination: hostPayoutAccount.stripeAccountId,
      amount: payment.transaction_amount
    },
  }

  if (isUser.email) {
    paymentIntentData.receipt_email = isUser.email; // Include email if available
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

  return paymentIntent;
  
 
};

export const bookEventServices = {
  bookingIntentService,
};
