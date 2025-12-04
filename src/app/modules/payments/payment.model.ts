import { model, Schema } from "mongoose";
import { IPayment, TransactionStatus } from "./payment.interface";

const paymentSchema = new Schema<IPayment>({
    booking: {type: Schema.Types.ObjectId, required: true, ref: 'booking'},
    transaction_id: {type: String},
    transaction_amount: {type: Number},
    transaction_status: {type: String, enum: [...Object.keys(TransactionStatus)], default: TransactionStatus.PENDING},
    paymentGetwayData: {type: Object}
}, {
    timestamps: true,
    versionKey: false
});


const Payment = model<IPayment>('payment', paymentSchema);

export default Payment;