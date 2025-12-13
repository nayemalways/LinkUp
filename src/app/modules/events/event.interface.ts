import { Types } from 'mongoose';
import { ICoord } from '../users/user.interface';

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Featured {
  TRENDING = 'TRENDING',
  POPULAR = 'POPULAR',
}

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface IEvent {
  host: Types.ObjectId;
  co_hosts?: Types.ObjectId;
  category: Types.ObjectId;
  reviews?: Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  venue: string;
  event_start: Date;
  event_end: Date;
  time_zone: string;
  organization?: Types.ObjectId;
  event_status?: EventStatus;
  featured?: Featured;
  price: number;
  max_attendence: number;
  age_limit: number;
  avg_rating: number;
  visibility: EventVisibility;
  coord?: ICoord;
  address: {
    city: string;
    state: string;
    postal: string;
    country: string;
  };
}
