import { model, Schema } from "mongoose";
import { INotification, INotificationPreference, NotificationCategory, NotificationType } from "./notification.interface";


const notificationSchema = new Schema<INotification>({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    eventId: {type: Schema.Types.ObjectId, ref: 'User'},
    chatId: {type: Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, required: true, enum: [...Object.values(NotificationType)]},
    title: {type: String, required: true},
    description: {type: String},
    data: {type: Object},
    isRead: {type: Boolean, default: false}
}, {
    timestamps: true,
    versionKey: false
});

const notificationPreferenceSchema = new Schema<INotificationPreference>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: String, required: true, enum: [...Object.values(NotificationType)]},
    channel: {
        push: {type: Boolean, default: false},
        email: {type: Boolean, default: true},
        inApp: {type: Boolean, default: true}
    },
    category: {type: String, required: true, enum: [...Object.values(NotificationCategory)]}
},{
     timestamps: true,
    versionKey: false
})

// Indexing for faster loading
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
export const NotificationPreference = model<INotificationPreference>('NotificationPreference', notificationPreferenceSchema);

 