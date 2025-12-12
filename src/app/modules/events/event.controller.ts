/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { eventServices } from "./event.service";
import { JwtPayload } from "jsonwebtoken";


const createEvent = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;

    const payload = {
        ...req.body,
        images: req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : []
    }
    const result = await eventServices.createEventService(payload, user);
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Event created successfully!",
        data: result
    })
});



export const eventControllers = {
    createEvent
}