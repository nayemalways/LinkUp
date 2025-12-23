import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser, Role } from './user.interface';
import User from './user.model';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { validatePhone } from '../../utils/phoneNumberValidatior';
import { Types } from 'mongoose';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { NotificationPreference } from '../notifications/notification.model';
import Booking from '../booking/booking.model';
import Event from '../events/event.model';

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

  if (payload.organizationName) {
    userPayload.role = Role.ORGANIZER;
  }

  const creatUser = await User.create(userPayload); // Create user

  // Notification preference setup can be added here in future
  await NotificationPreference.create({
    user: creatUser?._id,
    channel: {
      push: true,
      email: true,
      inApp: true,
    },
    directmsg: true,
    app: {
      product_updates: true,
      special_offers: true,
    },
    event: {
      event_invitations: true,
      event_changes: true,
      event_reminders: true,
    },
  });

  return creatUser;
};

// GET ALL USERS
const getAllUserService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder
    .filter()
    .textSearch()
    .select()
    .sort()
    .paginate()
    .build();

  const meta = await queryBuilder.getMeta();
  return {
    meta,
    users,
  };
};

// GET ME
const getMeService = async (userId: string) => {
  const user = await User.aggregate([
    // Stage 1: Matching
    { $match: { _id: new Types.ObjectId(userId) } },

    // Stage 2: Join with interests
    {
      $lookup: {
        from: 'categories',
        localField: 'interests',
        foreignField: '_id',
        as: 'interest',
      },
    },

    // Projection
    {
      $project: {
        password: 0,
        interests: 0,
      },
    },
  ]);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

// GET PROFILD 
const getProfileService = async (userId: string) => {

  if(!userId){
    throw new AppError(400, 'User ID is required');
  }

  const user = await User.findById(userId).select('-password -auths');
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  
  const totalEventsJoinedPromise =  Booking.countDocuments({ user: user._id });
  const totalEventsOrganizedPromise =  Event.find({ host : user._id }).countDocuments(); 

  const [totalEventsJoined, totalEventsOrganized] = await Promise.all([ totalEventsJoinedPromise, totalEventsOrganizedPromise]);

  
  return {
    totalEventsJoined,
    totalEventsOrganized,
    ...user.toObject()
  };
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
  if (decodedToken.role === Role.USER || decodedToken.role === Role.ORGANIZER) {
    const allowedUpdates = [
      'fullName',
      'avatar',
      'gender',
      'phone',
      'interests',
      'coord',
      'fcmToken',
      'bio',
      'instagramHandle',
    ];

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
  const updatedUser = await User.findByIdAndUpdate(
    new Types.ObjectId(userId),
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedUser;
};

// DELTE USER
const userDeleteService = async (userId: string, decodedToken: JwtPayload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User already deleted!');
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
};

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
  userDeleteService,
  getAllUserService,
  getProfileService
};
