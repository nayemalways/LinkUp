import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { createReviewService } from './review.service';
import AppError from '../../errorHelpers/AppError';

export const createReviewController = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user?.userId;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    const eventId = new Types.ObjectId(req.params.eventId);
    const { vote, comment } = req.body;

    const review = await createReviewService({
      userId: new Types.ObjectId(userId),
      eventId,
      vote,
      comment,
    });

    SendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Review submitted successfully',
      data: review,
    });
  }
);
