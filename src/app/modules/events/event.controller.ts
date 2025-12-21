/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { StatusCodes } from 'http-status-codes';
import { eventServices } from './event.service';
import { JwtPayload } from 'jsonwebtoken';

// CREATE EVENT CONTROLLER
const createEvent = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;

    const payload = {
      ...req.body,
      images: req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [],
    };
    const result = await eventServices.createEventService(payload, user);
    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Event created successfully!',
      data: result,
    });
  }
);

// GET EVENT CONTROLLER
const getEvents = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;

    const result = await eventServices.getEventsService(
      user,
      req.query as Record<string, string>
    );

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Event fetched successfully!',
      data: result,
    });
  }
);

// GET INTERESTED EVENTS CONTROLLER
const getInterestEvents = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;

    const result = await eventServices.getInterestEventsService( user, req.query as Record<string, string>);

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Interested events fetched successfully!',
      data: result,
    });
  }
);


// GET EVENT DETAILS CONTROLLER
const getEventDetails = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const eventId  = req.params?.eventId;
    
    const result = await eventServices.getEventDetailsService(user, eventId );

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Event details fetched successfully!',
      data: result,
    });
  }
);

// UPDATE EVENT CONTROLLER
const updateEvent = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const eventId  = req.params?.eventId;

    const payload = {
      ...req.body,
      images: req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [],
    };
    
    const result = await eventServices.updateEventService(user, eventId, payload);

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Event updated successfully!',
      data: result,
    });
  }
);


// UPDATE EVENT CONTROLLER
const getMyEvents = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const query = req.query as Record<string, string>
    
    const result = await eventServices.getMyEventsService(user, query);

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'My events fetched successfully!',
      data: result,
    });
  }
);



export const eventControllers = {
  createEvent,
  getEvents,
  getEventDetails,
  getInterestEvents,
  updateEvent,
  getMyEvents
};
