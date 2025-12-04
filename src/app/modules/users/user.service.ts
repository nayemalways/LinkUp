import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser } from './user.interface';
import User from './user.model';
import { sendEmail } from '../../utils/sendMail';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';


const createUserService = async (payload: Partial<IUser>) => {
  const { email, ...rest } = payload;
  const isUser = await User.findOne({ email });

  if (isUser) {
    throw new AppError(400, 'User aleready exist with this email!');
  }

  const authUser: IAuthProvider = {
    provider: 'credentials',
    providerId: payload.email as string,
  };

  const generateOTP = randomOTPGenerator(1000, 9999);
 
  const userPayload = {
    email,
    auths: authUser,
    otp: generateOTP,

    ...rest,
  };

  const creatUser = await User.create(userPayload);

  // Send OTP to verify
  // sendEmail({
  //   to: creatUser.email,
  //   subject: 'User verify OTP',
  //   templateName: 'otp',
  //   templateData: {
  //     name: creatUser.name,
  //     otp: creatUser.otp,
  //   },
  // });


 
  // Delete User if he is not verified within __ time
  setTimeout(async () => {
    if(!creatUser.isVerified) {
      await User.findByIdAndDelete(creatUser._id);
    }
  }, 1000 * 60 * 60 * 24 );


  return {
    _id: creatUser._id,
    name: creatUser.name,
    email: creatUser.email,
    role: creatUser.role,
  };
};

const verifyUserService = async (email: string, otp: string) => {
  if (!email || !otp) {
    throw new AppError(400, 'OTP required!');
  }

  const isUser = await User.findOne({ email }).select('-password -auths');
  if (!isUser) {
    throw new AppError(400, 'User not found by this email!');
  }

 

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
  sendEmail({
    to: isUser.email,
    subject: 'User verify OTP',
    templateName: 'otp',
    templateData: {
      name: isUser.name,
      otp: generateOTP,
    },
  });

  return isUser;
};

// Export All Services
export const userServices = {
  createUserService,
  resendOTPService,
  verifyUserService,
};
