import { model, Schema } from 'mongoose';
import { IFavouriteEvent } from './favourite.interface';

const favouriteSchema = new Schema<IFavouriteEvent>(
  {
    event: { type: Schema.Types.ObjectId, required: true, ref: 'event' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

favouriteSchema.index({ user: 1, event: 1 }, { unique: true });

export const FavouriteEvent = model<IFavouriteEvent>(
  'favouriteEvent',
  favouriteSchema
);
