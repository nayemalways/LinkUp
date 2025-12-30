/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { dashboardService } from "./dashboard.service";


// GET DASBOARD ANALYTICS
const dashboardStats = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await dashboardService.dashboardStatsService();
    SendResponse(res, {
        success : true,
        statusCode: StatusCodes.OK,
        message: "Dashboard state fetched!",
        data: result
    })
});


// DAILY USER ACTIVITY
const userActivity = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await dashboardService.dailyUserActivityService(query);

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message:"Fetched users activity!",
        data: result
    })
})


// DAILY USER ACTIVITY
const getRevenue = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.query as Record<string, string>;
    const { eventId } = req.params;
    const result = await dashboardService.getRevenueService( type);

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message:"Fetched revenue!",
        data: result
    })
})


export const dashboardControllers = {
    dashboardStats,
    userActivity,
    getRevenue
}