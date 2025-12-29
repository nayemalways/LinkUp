/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import env from '../config/env';
import { ISponsored } from '../modules/events/event.interface';
import Event from '../modules/events/event.model';
import { NotificationType } from '../modules/notifications/notification.interface';
import { IPayment, PaymentStatus } from '../modules/payments/payment.interface';
import Payment from '../modules/payments/payment.model';
import {
  ISponsoredPackage,
  SponsorStatus,
} from '../modules/sponsored/sponsored.interface';
import {
  Sponsored,
  SponsoredPackage,
} from '../modules/sponsored/sponsored.model';
import User from '../modules/users/user.model';
import { sendPersonalNotification } from './notificationsendhelper/user.notification.utils';
import { sendEmail } from './sendMail';

export const sponsoredSuccessHandler = async (paymentIntent: any) => {
  // Meta Data From Payment to update DB
  const metadata = paymentIntent.metadata;
  const paymentPayload: Partial<IPayment> = {
      payment_intent: paymentIntent?.id,
      payment_method_id: paymentIntent?.payment_method,
      payment_status:
        paymentIntent?.status === 'succeeded'
          ? PaymentStatus.PAID
          : PaymentStatus.FAILED,
      receipt_email: paymentIntent?.receipt_email,
      currency: paymentIntent?.currency
    };
  
  // UPDATE DATABASE
  const sponsoredPackage = (await SponsoredPackage.findOne({
      _id: metadata.package,
    })) as ISponsoredPackage;
    
    // ==========FULL OPERATION HERE=========
    if (!sponsoredPackage) {
        console.log('Package not found!');
    } else {
        // PAYMENT

    const payment = await Payment.findByIdAndUpdate(
      metadata.payment,
      {
        payment_intent: paymentPayload?.payment_intent,
        payment_method_id: paymentPayload?.payment_method_id,
        payment_status: paymentPayload.payment_status,
        currency: paymentPayload?.currency,
        receipt_email: paymentPayload?.receipt_email,
      },
      { new: true, runValidators: true }
    );


    // SPONSORED
const currentDate = new Date();

// Create a copy of currentDate to avoid modifying it
const endDate = new Date(currentDate);
endDate.setDate(currentDate.getDate() + Number(sponsoredPackage.duration));

    const sponsored = await Sponsored.findByIdAndUpdate(
      metadata.sponsored,
      {
        startDate: currentDate,
        endDate: endDate,
        sponsor_status: SponsorStatus.APPROVED,
      },
      { new: true, runValidators: true }
    );

    console.log("Sponsored", sponsored)

    // RESOLVE PROMISE
    // const [payment, sponsored] = await Promise.all([
    //   paymentPromise,
    //   sponsoredPromise,
    // ]);

    console.log("Payemnt", payment)

    // WITHDRAW SPONSORSHIP AFTER DURATION END
    setTimeout(
      async () => {
        await Sponsored.findByIdAndUpdate(sponsored?._id, {
          sponsor_status: SponsorStatus.EXPIRED,
        });
      },
      Number(sponsoredPackage.duration) * 24 * 60 * 60 * 1000
    );



    // NOTIFY HOST THAT HIS PAYMENT SUCCESSFULL AND HIS EVENT ARE SPONSORED
    setImmediate(async () => {
      try {
        const event = await Event.findOne({ _id: sponsored?.event });
        const host = await User.findOne({ _id: event?.host }).select(
          'fullName email'
        );

        const capitalize = (str: string) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        if (
          payment?.payment_status === PaymentStatus.PAID &&
          sponsored?.sponsor_status === SponsorStatus.APPROVED
        ) {
          // NOTIFICATION
          await sendPersonalNotification({
            user: sponsored.user,
            title: `Congratulations! Your event ${capitalize(sponsored.sponsor_type)}!🎉`,
            description: `Your event has successfully ${capitalize(sponsored.sponsor_type)}. Now your event will get more reach to the visitors.`,
            type: NotificationType.EVENT,
            data: {
              eventId: event?._id,
              image: event?.images[0],
            },
          });

          // SEND EMAIL
          sendEmail({
            to: host?.email as string,
            subject: `LinkUp - Your event "${capitalize(sponsored.sponsor_type)}" payment is successful`,
            templateName:
              sponsored.sponsor_type === ISponsored.SPONSORED
                ? 'eventSponsoredUpdate'
                : 'eventBoostedUpdate',
            templateData: {
              event_title: event?.title,
              event_venue: event?.venue,
              event_date: dayjs(event?.event_start).format(
                'MM/DD/YYYY, hh:mm:ss A'
              ),
              sponsor_name: 'LinkUp',
              support_email: env?.ADMIN_GMAIL,
            },
          });
        }
      } catch (error) {
        console.log(
          'Notification sending error from stripe.sponsored_webhook.ts',
          error
        );
      }
    });
  }
};
