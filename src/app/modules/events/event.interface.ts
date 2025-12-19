import { Types } from 'mongoose';


export enum EventStatus {
  ACTIVE = 'ACTIVE',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Featured {
  SPONSORED= 'SPONSORED',
  BOOST = 'BOOST',
  NORMAL = 'NORMAL'
}

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum LocationType {
  POINT = 'Point'
}

export interface ILocation {
  type: LocationType,
  coordinates: number[];
}

export interface IEvent {
  host: Types.ObjectId;
  co_host?: Types.ObjectId;
  category: Types.ObjectId;
  reviews?: Types.ObjectId;
  title: string; // IN APP/ PUSH
  description: string; // IN APP/ PUSH
  images: string[];
  deletedImages?: string[];
  venue: string; // IN APP/ PUSH / EMAIL - AND CHANGE THE COORDINATES
  event_start: Date; // IN APP/ PUSH / EMAIL
  event_end: Date; // IN APP / PUSH / EMAIL
  time_zone: string; // IN APP/ PUSH // EMAIL
  organization?: Types.ObjectId; 
  event_status?: EventStatus; // IF CANCELLED: IN APP / PUSH / EMAIL AND ( REFUND MONEY )
  featured?: Featured; // Ok - // IF CHANGED HOST, CO-HOST WILL NOTIFIED
  price: number; 
  max_attendence: number;
  age_limit: number; 
  avg_rating: number;
  visibility: EventVisibility; // PUBLIC/PRIVATE : ONLY EXISTING USER WILL GET NOTIFIED
  location?: ILocation; // ok // CAN'T UPDATE MANUALLY
  address: {
    city: string;
    state: string;
    postal: string;
    country: string;
  };
}


// Co Host Invite Interface

export enum CoHostStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPETED',
  DECLINE = 'DECLINE'
}

export interface CoHostInvite {
  event: Types.ObjectId,
  inviter: Types.ObjectId,
  invitee: Types.ObjectId,
  status: CoHostStatus
}
