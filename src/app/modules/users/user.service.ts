import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser } from './user.interface';
import User from './user.model';
// import { sendEmail } from '../../utils/sendMail';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';




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

  const creatUser = (await User.create( userPayload )) // Create user
  creatUser.password = undefined; // prevent password unveiling
  return creatUser;
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
};
