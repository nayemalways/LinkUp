export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
}

export interface IAuthProvider {
  provider: 'credentials' | 'instagram';
  providerId: string;
}

export enum IsActive {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface ICoord {
  lat: number;
  long: number;
}

export interface IUser {
  _id?: string;
  fullName: string;
  email: string;
  avatar?: string;
  password?: string;
  gender?: string;
  role?: Role;
  phone?: string;
  interests: string[];
  isActive?: IsActive;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths?: IAuthProvider[];
  coord?: ICoord;
}
