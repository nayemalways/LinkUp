/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { dashboardService } from "./dashboard.service";

const dashboardStats = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await dashboardService.dashboardStatsService();
    SendResponse(res, {
        success : true,
        statusCode: StatusCodes.OK,
        message: "Dashboard state fetched!",
        data: result
    })
});



export const dashboardControllers = {
    dashboardStats
}