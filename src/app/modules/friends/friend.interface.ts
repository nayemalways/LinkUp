import { Types } from "mongoose";

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    BLOCKED = 'BLOCKED'
}


export interface IFriendRequest {
    id?: Types.ObjectId;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: RequestStatus;
}