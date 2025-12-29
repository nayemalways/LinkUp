import { Types } from "mongoose";
import { ISponsored } from "../events/event.interface";


export enum SponsorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export enum ISponsoredPaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID'
}

export enum SponsoredPackageType {
  SPONSORED = "SPONSORED",
  BOOST =  "BOOST"
}

//===================== SPONSORED INTERFACE ========================
export interface ISponsoredship {
  _id?: Types.ObjectId;
  event: Types.ObjectId;
  user: Types.ObjectId;
  payment: Types.ObjectId;
  sponsor_type: ISponsored;
  sponsor_status: SponsorStatus;
  amount: number;
  currency?: string;
  startDate?: Date;
  endDate?: Date;
}

//===================== SPONSORED PACKAGE INTERFACE ================
export interface ISponsoredPackage {
  _id?: Types.ObjectId;
  title: string;
  benifits: string[];
  price: number;
  type: SponsoredPackageType;
  duration: number; // eg. 7 days / 15 days
}