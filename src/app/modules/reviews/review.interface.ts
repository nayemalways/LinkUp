import { Types } from "mongoose";

export interface IReview {
    id?: Types.ObjectId;
    user: Types.ObjectId;
    event: Types.ObjectId;
    rating: number;
    comment: string;
}