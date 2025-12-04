/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum TransactionStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface IPayment {
    id?: string;
    booking: Types.ObjectId;
    transaction_id: string;
    transaction_amount: number;
    transaction_status: TransactionStatus
    paymentGetwayData?: any;
}