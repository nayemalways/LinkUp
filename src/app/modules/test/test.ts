/* eslint-disable no-console */
import { Request, Response, Router } from "express";
import env from "../../config/env";
import { SendResponse } from "../../utils/SendResponse";
import { twilio } from "../../config/twilio.config";

const router = Router();

router.post('/otp_send', async (req: Request, res: Response) =>  {
    const otp = 458752;
    const phoneNumber = '+8801783795801';
    const sendOtp = await twilio.messages.create({
        to: phoneNumber,
        messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
        body: `Your LinkUp OTP is ${otp}. Valid for 5 minutes.`,
    });

    SendResponse(res, {
        success: true,
        statusCode: 200,
        message: "OTP sent succssful!",
        data: sendOtp
    })

 })


export const testRouter = router;
