import { model, Schema } from "mongoose";
import { IGroup } from "./group.interface";

const groupSchema = new Schema<IGroup>({
    group_admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group_name: {
        type: String,
        required: true
    },
    group_image: {
        type: String
    },
    group_members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: true
    },
    group_description: {
        type: String,
        required: true
    },
    media: {
        type: [String]
    }
}, { timestamps: true , versionKey: false});


const Group = model<IGroup>('Group', groupSchema);
export default Group;
