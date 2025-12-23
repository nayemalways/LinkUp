/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment.service";
import { JwtPayload } from "jsonwebtoken";


// CREATE STRIPE CONNECT ACCOUNT
const createStripeConnectAccount = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const { countryCode } = req.params;
    const result = await paymentServices.createStripeConnectAccountService(userId, countryCode);
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User stripe connect account created!",
        data: result
    })
});

// CHECK IF USER HAS STRPE CONNECT ACCOUNT
const checkAccountStatus = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const result = await paymentServices.checkAccountStatusService(userId);

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Stripe connect account checked successfully!",
        data: result
    })
});

const getConnectedBankAccount = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const result = await paymentServices.getConnectedBankAccountService(userId);

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Fetched connected payouts Bannk Account!",
        data: result
    })
})



export const paymentControllers = {
    createStripeConnectAccount,
    checkAccountStatus,
    getConnectedBankAccount
}