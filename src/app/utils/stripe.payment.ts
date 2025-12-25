/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Date } from "mongoose";
import { BookingStatus } from "../modules/booking/booking.interface";
import Booking from "../modules/booking/booking.model";
import Event from "../modules/events/event.model";
import { NotificationType } from "../modules/notifications/notification.interface";
import { IPayment, PaymentStatus } from "../modules/payments/payment.interface";
import Payment from "../modules/payments/payment.model";
import User from "../modules/users/user.model";
import { sendPersonalNotification } from "./notificationsendhelper/user.notification.utils";
import { sendEmail } from "./sendMail";
import env from "../config/env";

export const payemntSuccessHandler = async (object: any) => {;

    const paymentPayload: Partial<IPayment> = { 
    payment_intent: object?.id,  
    payment_method_id: object?.payment_method,  
    payment_status: object?.status === 'succeeded' ? PaymentStatus.PAID : PaymentStatus.FAILED,   
    receipt_email: object?.receipt_email,   
    transfer_data: {
        amount: object?.transfer_data?.amount,   
        destination: object?.transfer_data?.destination   
    }
};

const metadata = object.metadata;

// UPDATE DATABASE
const paymentPromise = Payment.findByIdAndUpdate(metadata.payment, {
    payment_intent: paymentPayload.payment_intent,
    payment_method_id: paymentPayload.payment_method_id,
    payment_status: paymentPayload.payment_status,
    receipt_email: paymentPayload.receipt_email,
    transfer_data: paymentPayload.transfer_data
}, {new: true, runValidators: true});
const bookingConfirmPromise =  Booking.findByIdAndUpdate(metadata.booking, { booking_status: BookingStatus.CONFIRMED }, { new: true, runValidators: true })


const currentDate = new Date();
const [payment, bookingConfirm] = await Promise.all([paymentPromise, bookingConfirmPromise])


// NOTIFY USER HE IS JOINED THE EVENT
if (payment?.payment_status === PaymentStatus.PAID && bookingConfirm?.booking_status === BookingStatus.CONFIRMED) {
    const event = await Event.findById(bookingConfirm.event);
    const user = await User.findById(bookingConfirm.user).select("fullName email");

    // NOTIFICATION
    setImmediate(async () => {
        await sendPersonalNotification({
            user: bookingConfirm.user,
            title: `Congratulations! Your booking has confirmed!🎉`,
            description: `You have joined - ${event?.title} event!`,
            type: NotificationType.EVENT,
            data: {
                eventId: event?._id,
                image: event?.images[0]
            }
        })
    });

    // EMAIL
    sendEmail({
        to: user?.email as string,
        subject: "LinkUp - Your event booking payment is successful",
        templateName: "bookingConfirmation",
        templateData: {
            event_title: event?.title,
            user_name: user?.fullName,
            amount: payment.transaction_amount,
            transaction_id: payment.transaction_id,
            date: currentDate,
            year: currentDate.getFullYear(),
            support: env.ADMIN_GMAIL
        }
    })
}


};


export const paymetFailedHandler = async (object: any) => {
    console.log("Payment Failed: ", object);
   
}