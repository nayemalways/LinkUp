import { Types } from "mongoose";
import { ISponsored } from "../events/event.interface";


export enum SponsorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED'
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
  payment: Types.ObjectId;
  sponsor_type: ISponsored;
  sponsor_status: SponsorStatus;
  amount: number;
  startDate?: Date;
  endDate?: Date;
}

//===================== SPONSORED PACKAGE INTERFACE ========================
export interface ISponsoredPackage {
  _id?: Types.ObjectId;
  title: string;
  benifits: string[];
  price: number;
  type: SponsoredPackageType
}