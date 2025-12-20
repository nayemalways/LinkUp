import { Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { userServices } from './user.service';
import { createUserTokens } from '../../utils/user.tokens';
import { SetCookies } from '../../utils/setCookie';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from './user.interface';
import { Types } from 'mongoose';

// REGISTER ACCOUNT
const registerUser = CatchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUserService(req.body);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users created successful!',
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
    message: "User fetched successful!",
    data: result
  })
})

// GET ME
const getAllUser = CatchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string> ;
  const result = await userServices.getAllUserService(query);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users fetched successful!",
    data: result
  })
})

// USER UPDATE
const userUpdate = CatchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const body = req.body;
  const decodedToken = req.user as JwtPayload;

  const payload = {
    ...body,
    avatar: req.file?.path as string
  }

  const result = await userServices.userUpdateService(userId, payload, decodedToken);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User updated successful!",
    data: result
  })
})

// USER UPDATE
const userDelete = CatchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const decodedToken = req.user as JwtPayload;

  const result = await userServices.userDeleteService(userId, decodedToken);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User deleted successful!",
    data: result
  })
})


// VERIFY USER
const verifyUser = CatchAsync(async (req: Request, res: Response) => {
  const email = req.cookies['email'] as string;
  const otp = req.params.otp;

  const result = await userServices.verifyUserService(email, otp);

  const jwtPayload = {
    userId: result?._id as Types.ObjectId,
    email: result?.email as string,
    role: result?.role as Role,
    isVerified: result?.isVerified,
  };

  // Set refreshToken and accessToken in Cookies
  const userTokens = await createUserTokens(jwtPayload );
  SetCookies(res, userTokens);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User verified successful!',
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
    message: 'OTP Sent successful!',
    data: null,
  });
});


// EXPORT ALL CONTROLLERS
export const userControllers = {
  registerUser,
  verifyUser,
  resendOTP,
  getMe,
  userUpdate,
  userDelete,
  getAllUser
};
