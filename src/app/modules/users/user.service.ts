import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser, Role } from './user.interface';
import User from './user.model';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { validatePhone } from '../../utils/phoneNumberValidatior';
import { sendPersonalNotification } from '../../utils/notificationsendhelper/user.notification.utils';
import { NotificationType } from '../notifications/notification.interface';

// CREATE USER
const createUserService = async (payload: Partial<IUser>) => {
  const { email, ...rest } = payload;
  const isUser = await User.findOne({ email });

  if (isUser) {
    throw new AppError(400, 'User aleready exist. Please login!');
  }

  // Save User Auth
  const authUser: IAuthProvider = {
    provider: 'credentials',
    providerId: payload.email as string,
  };

  const userPayload = {
    email,
    auths: authUser,
    ...rest,
  };

  const creatUser = await User.create(userPayload); // Create user
  // creatUser.password = undefined; // prevent password unveiling
  return creatUser;
};

// GET ME
const getMeService = async (userId: string) => {
  const user = await User.findById(userId, { password: 0 }) as IUser;

  if(!user) {
    throw new AppError(404, "User not found");
  }

  if (user._id) {
    sendPersonalNotification({
      title: "User fetched successfully!",
      user: user._id,
      type: NotificationType.CHAT,
      description: "User fetching description.",

    });
  }

  return user;
};

// USER UPDATE
const userUpdateService = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // USER & ORGANIZER can ONLY update their own profile - Only admin can update others
  if (
    (decodedToken.role === Role.USER || decodedToken.role === Role.ORGANIZER) &&
    decodedToken.userId !== userId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You can only update your own profile'
    );
  }

  // Block password update from this route
  if (payload.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can't update your password from this route!"
    );
  }

  // Phone number validation by - E.164 Rules
  if (payload.phone) {
    validatePhone(payload.phone);
  }

  // Role update protection
  if (payload.role) {
    if (
      decodedToken.role === Role.USER ||
      decodedToken.role === Role.ORGANIZER
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to update roles!'
      );
    }
  }

  // USER & ORGANIZER cannot update isActive, isDeleted, isVerified
  if (
    payload?.isActive !== undefined ||
    payload?.isDeleted !== undefined ||
    payload?.isVerified !== undefined
  ) {
    if (
      decodedToken.role === Role.USER ||
      decodedToken.role === Role.ORGANIZER
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to update account status!'
      );
    }
  }

  // FIELD WHITELISTING for USER & ORGANIZER
  if (
    decodedToken.role === Role.USER ||
    decodedToken.role === Role.ORGANIZER
  ) {

    const allowedUpdates = [ 'fullName', 'avatar', 'gender', 'phone', 'interests', 'coord', 'fcmToken'];

    Object.keys(payload).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          `You are not allowed to update: ${key}`
        );
      }
    });
  }

  // Update User
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const userDeleteService = async (userId: string, decodedToken: JwtPayload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User already deleted!");
  }

  const allowedRoles = [Role.ADMIN];


if (!allowedRoles.includes(decodedToken.role)) {
  if (decodedToken.userId !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "You can't delete others!");
  }
}

  user.isDeleted = true;
  await user.save();

  return null;
}

// VERIFY USER
const verifyUserService = async (email: string, otp: string) => {
  if (!email || !otp) {
    throw new AppError(400, 'OTP required!');
  }

  const isUser = await User.findOne({ email }).select('-password -auths');
  if (!isUser) {
    throw new AppError(400, 'User not found by this email!');
  }

  // if (isUser.otp !== otp || otp.length < 4) {
  //   throw new AppError(400, 'Invalid OTP!');
  // }

  const updateUser = await User.findOneAndUpdate(
    { email },
    { isVerified: true, otp: 0, $unset: { deleteAfter: '' } },
    {
      runValidators: true,
      new: true,
      projection: {
        password: 0,
        otp: 0,
        auths: 0,
        otpExpireAt: 0,
        updatedAt: 0,
        createdAt: 0,
      },
    }
  );

  return updateUser;
};

// RESEND OTP
const resendOTPService = async (email: string) => {
  if (!email) {
    throw new AppError(400, 'Email required!');
  }

  const isUser = await User.findOne({ email });
  if (!isUser) {
    throw new AppError(400, 'User not found by this email!');
  }

  if (isUser.isVerified) {
    throw new AppError(400, 'User already verified!');
  }

  const generateOTP = randomOTPGenerator(1000, 9999);
  const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min

  await User.findOneAndUpdate(
    { email },
    { otp: generateOTP, otpExpireAt: otpExpiry },
    {
      runValidators: true,
      new: true,
      projection: {
        password: 0,
        otp: 0,
        auths: 0,
        otpExpireAt: 0,
        updatedAt: 0,
        createdAt: 0,
      },
    }
  );

  // Send OTP to verify
  // sendEmail({
  //   to: isUser.email,
  //   subject: 'User verify OTP',
  //   templatefullName: 'otp',
  //   templateData: {
  //     fullName: isUser.fullName,
  //     otp: generateOTP,
  //   },
  // });

  return isUser;
};

// EXPORT ALL SERVICE
export const userServices = {
  createUserService,
  resendOTPService,
  verifyUserService,
  getMeService,
  userUpdateService,
  userDeleteService
}
