import { Types } from "mongoose";

export interface IBooking {
    id?: Types.ObjectId;
    user: Types.ObjectId;
    event: Types.ObjectId;
    payment: Types.ObjectId;
    price: number;
    booking_status: string;
}