import mongoose from 'mongoose';
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
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String },
    password: { type: String, select: false },
    gender: { type: String },
    phone: { type: String },
    interests: [{ type: String }],
    isActive: {
      type: String,
      enum: [...Object.values(IsActive)],
      default: IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: [...Object.values(Role)], default: Role.USER },
    auths: [authProviderSchema],
    coord: { type: { lat: { type: Number }, long: { type: Number } } },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Hashed password
userSchema.pre('save', async function (next) {
  if (!this?.password) next();
  const hashedPassword = await bcrypt.hash(
    this?.password as string,
    parseInt(env?.BCRYPT_SALT_ROUND)
  );
  this.password = hashedPassword;
  next();
});

const User = mongoose.model<IUser>('user', userSchema);

export default User;
