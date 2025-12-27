import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { ISponsoredPackage, SponsorStatus } from './sponsored.interface';
import { Sponsored, SponsoredPackage } from './sponsored.model';
import { stripe } from '../../config/stripe.config';
import Event from '../events/event.model';
import User from '../users/user.model';
import { IUser } from '../users/user.interface';
import Stripe from 'stripe';
import Payment from '../payments/payment.model';
import { generateTransactionId } from '../../utils/generateTransactionId';
import { PaymentStatus } from '../payments/payment.interface';

// CREATE SPONSORSHIP PACKAGE SERVICE
const createSponsoredPackageService = async (
  paylod: Partial<ISponsoredPackage>
) => {
  const isExist = await SponsoredPackage.findOne({
    type: paylod.type?.toLocaleUpperCase(),
  });
  if (paylod.title === isExist?.title) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'A package already exist by ths name!'
    );
  }

  if (isExist) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Already a package exist by this type!'
    );
  }

  const createPackage = await SponsoredPackage.create(paylod);
  return createPackage;
};

// GET ALL AVAILABLE PACAGE SERVICE
const getAvailablePackageService = async () => await SponsoredPackage.find();

// UPDATE PACKAGE
const updatePackageService = async (
  packageId: string,
  payload: Partial<ISponsoredPackage>
) => {
  const isExist = await SponsoredPackage.findById(packageId);
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Package not found to update!');
  }

  const updatePackage = await SponsoredPackage.findByIdAndUpdate(
    packageId,
    payload,
    { new: true, runValidators: true }
  );
  return updatePackage;
};

// CREATE SPONSORE PAYMENT INTENT
const sponsoredPaymentIntentService = async (
  userId: string,
  eventId: string,
  packageId: string
) => {

  // CHECK PACKAGE
  const sponsoredPackage = await SponsoredPackage.findOne({ _id: packageId });
  if (!sponsoredPackage) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No package found!');
  }

  // CHECK EVENT
  const event = await Event.findOne({ _id: eventId });
  if (!event) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No event found!');
  }

  if (userId !== event.host.toString()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Host or Organizer can sponsored/boost this event!'
    );
  }

  const user = await User.findOne({ _id: userId }) as IUser;

  const sponsored = await Sponsored.create({
    amount: sponsoredPackage.price,
    event: event._id,
    sponsor_type: sponsoredPackage.type,
    sponsor_status: SponsorStatus.PENDING
  });

    const payment = await Payment.create({
        sponsored: sponsored._id,
        transaction_amount: sponsoredPackage.price,
        transaction_id: generateTransactionId(),
        payment_status: PaymentStatus.PENDING
   });

   // Update payment reference
   sponsored.payment = payment._id;
   await sponsored.save()

  // Prepare the payment data
  const paymentIntentData: Stripe.PaymentIntentCreateParams = {
    amount: Number(sponsoredPackage.price * 100),
    currency: 'usd',
    metadata: {
      sponsorship_type: sponsoredPackage.type,
      package: sponsoredPackage._id.toString(),
      event: event._id.toString()
    },
    description: 'Event Sponsorship Payment',
  };


  if (user.email) {
    paymentIntentData.receipt_email = user.email; // Include email if available
  }

  // Create the payment intent
  const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

  return paymentIntent;
};

export const sponsoredServices = {
  createSponsoredPackageService,
  getAvailablePackageService,
  updatePackageService,
  sponsoredPaymentIntentService
};
