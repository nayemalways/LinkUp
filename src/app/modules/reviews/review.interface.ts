import { Types } from 'mongoose';

export interface IReview {
  id?: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  comment: string;
  vote: 'UP' | 'DOWN';
  host: Types.ObjectId;
  isDeleted?: boolean;
}
