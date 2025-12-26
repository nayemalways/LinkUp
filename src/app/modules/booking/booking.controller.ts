/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { bookEventServices } from "./booking.service";
import { IBooking } from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";

const bookEvent = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { userId } = req.user as JwtPayload;
    const result = await bookEventServices.bookingIntentService(payload as Partial<IBooking>, userId);
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Booking intend created",
        data: result
    })
});



export const bookingControllers = {
    bookEvent
}