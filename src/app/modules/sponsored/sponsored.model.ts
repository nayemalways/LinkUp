import { model, Schema } from "mongoose";
import {  ISponsoredPackage, ISponsoredship, SponsoredPackageType, SponsorStatus } from "./sponsored.interface";
import { ISponsored } from "../events/event.interface";
 

//===================== SPONSORED SCHEMA ========================
const sponsoredSchema = new Schema<ISponsoredship>({
    event: { type: Schema.Types.ObjectId, ref: 'event', required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'payment' },
    sponsor_type: { type: String, enum: [...Object.keys(ISponsored)], default: ISponsored.NORMAL , required: true },
    sponsor_status: { type: String, enum: [...Object.keys(SponsorStatus)], required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
}, { timestamps: true, versionKey: false });


// ===================== SPONSORED PACKAGE SCHEMA ========================
const sponsoredPackage = new Schema({
    title: { type: String, required: true },
    benifits: [{ type: String, required: true }],
    price: { type: Number, default: 0, required: true },
    type: { type: String, enum: [...Object.keys(SponsoredPackageType)], required: true}
});


export const Sponsored = model<ISponsoredship>('sponsored_request', sponsoredSchema);
export const SponsoredPackage = model<ISponsoredPackage>('sponsored_package', sponsoredPackage);