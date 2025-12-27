/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import querystring from 'querystring';
import env from '../../config/env';
import axios from 'axios';

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
const verifyOTP = CatchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.params;
  const result = await authService.verifyOTPService( email, otp );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "OTP verified success!",
    data: result
  })

})

// RESET PASSWORD
const resetPassword = CatchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization as string;
  const { newPassword } = req.body;
  const result = await authService.resetPasswordService( token, newPassword );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset success!",
    data: result
  })

})



async function getUserDetails(accessToken: string) {
  try {
    // Note the change in host and fields (user_id instead of id)
    const response = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        fields: 'user_id,username,account_type,media_count',
        access_token: accessToken
      }
    });
    // The new API returns data inside a 'data' array or object depending on version
    return response.data; 
  } catch (error) {
    console.error('Error fetching user details', error);
    throw error;
  }
}

 
export const authController = {
  credentialsLogin,
  getNeAccessToken,
  changePassword,
  forgetPassword,
  verifyOTP,
  resetPassword,
};
