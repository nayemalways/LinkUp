import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { verifyToken } from '../../utils/jwt';
import env from '../../config/env';
import User from '../users/user.model';
import { IsActive } from '../users/user.interface';
import { createUserTokens, CustomJwtPayload } from '../../utils/user.tokens';

const getNewAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Refresh token needed!');
  }

  const tokenVerify = verifyToken( refreshToken, env.JWT_REFRESH_SECRET ) as CustomJwtPayload; // VERIFY TOKEN
  const isUserExists = await User.findById(tokenVerify.userId as string); // FIND USER BY ID

  if (!isUserExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Doesn't Exist");
  }

  if ( isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE ){
     throw new AppError(StatusCodes.BAD_REQUEST, 'The User "blocked" or "inactive"');
  }
   
  if (isUserExists.isDeleted) {
     throw new AppError(StatusCodes.BAD_REQUEST, 'The user was "deleted"');
  }
   

  const jwtPayload = {
    userId: isUserExists?._id,
    email: isUserExists?.email,
    role: isUserExists?.role,
  };

  const userToken = await createUserTokens(jwtPayload); // Jsonwebtoken

  return {
    newAccessToken: userToken.accessToken,
    newRefreshToken: userToken.refreshToken
  };
};

export const authService = {
  getNewAccessToken,
};
