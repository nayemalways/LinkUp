import { JwtPayload } from 'jsonwebtoken';
import env from '../config/env';
import { generateToken } from './jwt';
import {  Role } from '../modules/users/user.interface';
import { Types } from 'mongoose';

export interface CustomJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
  email: string;
  role: Role;
  isVerified?: boolean;
}

export const createUserTokens = async (user: CustomJwtPayload) => {
  const jwtPayload: CustomJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    isVerified: user?.isVerified
  };

  // Jsonwebtoken
  const accessToken = generateToken(
    jwtPayload,
    env?.JWT_ACCESS_SECRET,
    env?.JWT_ACCESS_EXPIRATION
  );
  const refreshToken = generateToken(
    jwtPayload,
    env?.JWT_REFRESH_SECRET,
    env?.JWT_REFRESH_EXPIRATION
  );

  return {
    accessToken,
    refreshToken,
  };
};
