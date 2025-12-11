/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { categoryServices } from "./category.service";

const createEventCategory = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { category_name } = req.body;
    const result = await categoryServices.createEventCategoryService(category_name);
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Created event category!",
        data: result
    })
});


export const categoryControllers = {
    createEventCategory
}