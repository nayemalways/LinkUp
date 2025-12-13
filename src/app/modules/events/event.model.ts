import mongoose, { Schema } from 'mongoose';
import {
  IEvent,
  EventStatus,
  Featured,
  EventVisibility,
} from './event.interface';

const eventSchema = new mongoose.Schema<IEvent>(
  {
    host: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    co_hosts: { type: Schema.Types.ObjectId, ref: 'user' },
    category: { type: Schema.Types.ObjectId, required: true, ref: 'category' },
    reviews: { type: Schema.Types.ObjectId, ref: 'review' },
    title: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    venue: { type: String, required: true },
    event_start: { type: Date, required: true },
    event_end: { type: Date, required: true },
    time_zone: { type: String, required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'organization' },
    event_status: {
      type: String,
      enum: [...Object.values(EventStatus)],
      default: EventStatus.ACTIVE,
      required: true
      },
    featured: {
      type: String,
      enum: [...Object.values(Featured)]
      },
    price: { type: Number, required: true },
    max_attendence: { type: Number },
    age_limit: { type: Number },
    avg_rating: { type: Number },
    visibility: {
      type: String,
      enum: [...Object.values(EventVisibility)],
      required: true,
    },
    coord: { type: { lat: { type: Number }, long: { type: Number } }, _id: false },
    address: {
      city: { type: String  },
      state: { type: String },
      postal: { type: String },
      country: { type: String },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Indexing through search field
eventSchema.index({
  title: 'text',
  description: 'text',
  venue: 'text'
})

const Event = mongoose.model<IEvent>('event', eventSchema);

export default Event;
