import { model, Schema } from 'mongoose';
import { IMessage, MessageStatus } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'group',
    },
    message: { type: { text: String, image: String }, _id: false },
    status: {
      type: String,
      enum: [...Object.keys(MessageStatus)],
      default: MessageStatus.SENT,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'message',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Message = model<IMessage>('message', messageSchema);

export default Message;
