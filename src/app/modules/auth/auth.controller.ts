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
  const result = await authService.getNewAccessTokenService(refreshToken);

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

// FORGET PASSWORD
const forgetPassword = CatchAsync(async (req: Request, res: Response) => {
  const { email } = req.params;
  const result = await authService.forgetPasswrodService( email );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset OTP send to your email!",
    data: result
  })

})

// RESET PASSWORD
const resetPassword = CatchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.params;
  const { newPassword } = req.body;
  const result = await authService.resetPasswordService( email, otp, newPassword );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset success!",
    data: result
  })

})

export const authController = {
  credentialsLogin,
  getNeAccessToken,
  changePassword,
  forgetPassword,
  resetPassword
};
