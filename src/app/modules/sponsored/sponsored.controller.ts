/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { sponsoredServices } from "./sponsored.service";


// CREATE SPONSORSHIP PACKAGE
const createSponsoredPackage = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await sponsoredServices.createSponsoredPackageService(payload);
    
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Sponsorship package created!",
        data: result
    })
})

// GET ALL AVAILABLE PACAGE 
const getAvailablePackage = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await sponsoredServices.getAvailablePackageService( );

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Fetched available packages!",
        data: result
    })
})

// UPDATE PACKAGE
const updatePackage = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { packageId } = req.params;
    const result = await sponsoredServices.updatePackageService(packageId, payload);
    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Sponsored package updated!',
        data: result
    })
});






const requestSponsoredEvent = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const { eventId, sponsorType, amount } = req.body;

    SendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Sponsored event request created successfully',
        data: {}
    })
});


/*
1
 1. create sponsored package
 2. if free handle logic
 3. if paid create payment intent
 4. after payment update sponsored package status
*/


export const SponsoredController = {
    createSponsoredPackage,
    requestSponsoredEvent,
    getAvailablePackage,
    updatePackage
};