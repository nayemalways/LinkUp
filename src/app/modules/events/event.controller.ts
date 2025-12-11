import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { eventServices } from "./event.service";


const createEvent = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await eventServices.createEventService(req.body);
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