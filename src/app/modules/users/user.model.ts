/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { IAuthProvider, IsActive, IUser, Role } from './user.interface';
import bcrypt from 'bcrypt';
import env from '../../config/env';

const authProviderSchema = new mongoose.Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String },
    organizationName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String },
    password: { type: String, select: false },
    gender: { type: String },
    fcmToken: { type: String },
    phone: { type: String },
    interests: [{ type: Types.ObjectId }],
    instagramHandle: { type: String },
    isActive: {
      type: String,
      enum: [...Object.values(IsActive)],
      default: IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: [...Object.values(Role)], default: Role.USER },
    auths: [authProviderSchema],
    coord: {
      type: { lat: { type: Number }, long: { type: Number } },
      _id: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Hashed password
userSchema.pre('save', async function (next) {
  if (!this?.password) return next();

  try {
    const hashedPassword = await bcrypt.hash(
      this?.password as string,
      parseInt(env?.BCRYPT_SALT_ROUND)
    );
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Indexing through search field
userSchema.index({
   fullName: "text"
});

const User = mongoose.model<IUser>('user', userSchema);

export default User;
