import { Types } from "mongoose";

export interface IGroup {
    id?: Types.ObjectId;
    group_admin: Types.ObjectId;
    group_name: string;
    group_image?: string;
    group_members: Types.ObjectId[];
    group_description: string;
    media: string[]; // images
}