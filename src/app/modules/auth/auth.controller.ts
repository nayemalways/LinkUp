/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import passport from 'passport';
import AppError from '../../errorHelpers/AppError';
import httpStatus, { StatusCodes } from 'http-status-codes';
import { createUserTokens } from '../../utils/user.tokens';
import { SendResponse } from '../../utils/SendResponse';
import { authService } from './auth.service';
import { JwtPayload } from 'jsonwebtoken';

 // Login User
const credentialsLogin = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) next(err);

      if (!user) {
        return next(new AppError(httpStatus.FORBIDDEN, info.message));
      }

      const userTokens = await createUserTokens(user);

      SendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Login success',
        data: userTokens
      });
    })(req, res, next);
  }
);

// GET NEW ACCESS TOKEN
const getNeAccessToken = CatchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.getNewAccessToken(refreshToken);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "New accessToken generated!",
    data: result
  })

})

// CHANGE PASSWORD
const changePassword = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePasswordService(userId, {oldPassword, newPassword});

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password has been changed!",
    data: result
  })

})

export const authController = {
  credentialsLogin,
  getNeAccessToken,
  changePassword
};
