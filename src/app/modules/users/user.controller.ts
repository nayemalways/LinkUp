import { Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { userServices } from './user.service';
import { createUserTokens } from '../../utils/user.tokens';
import { SetCookies } from '../../utils/setCookie';
import { JwtPayload } from 'jsonwebtoken';
 
const registerUser = CatchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUserService(req.body);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users created successfully!',
    data: result,
  });
});


// GET ME
const getMe = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const result = await userServices.getMeService(userId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User fetched successfull!",
    data: result
  })
})

// USER UPDATE
const userUpdate = CatchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const payload = req.body;
  const decodedToken = req.user as JwtPayload;

  const result = await userServices.userUpdateService(userId, payload, decodedToken);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User updated successfull!",
    data: result
  })
})

// VERIFY USER
const verifyUser = CatchAsync(async (req: Request, res: Response) => {
  const email = req.cookies['email'] as string;
  const otp = req.params.otp;

  const result = await userServices.verifyUserService(email, otp);

  const jwtPayload = {
    _id: result?._id,
    email: result?.email,
    role: result?.role,
    isVerified: result?.isVerified,
  };

  // Set refreshToken and accessToken in Cookies
  const userTokens = await createUserTokens(jwtPayload);
  SetCookies(res, userTokens);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User verified successfuly!',
    data: {
      data: result,
    },
  });
});

// RESEND OTP
const resendOTP = CatchAsync(async (req: Request, res: Response) => {
  const email = req.cookies['email'] as string;
  await userServices.resendOTPService(email);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP Sent Successfully!',
    data: null,
  });
});


// EXPORT ALL CONTROLLERS
export const userControllers = {
  registerUser,
  verifyUser,
  resendOTP,
  getMe,
  userUpdate
};
