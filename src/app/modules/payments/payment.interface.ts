/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export interface IPayment {
    id?: string;
    booking: Types.ObjectId;
    transaction_id: string;
    transaction_amount: number;
    transaction_status: string
    paymentGetwayData?: any;
}