import mongoose, { model, Schema } from 'mongoose';
import {
  IEvent,
  EventStatus,
  EventVisibility,
  LocationType,
  CoHostInvite,
  CoHostStatus,
  ISponsored,
  EventJoinRequestType,
  IEventJoinRequest,
} from './event.interface';



// ================== CO-HOST INVITATION SCHEMA ====================
const CoHostInviteSchema = new Schema<CoHostInvite>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  inviter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  invitee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: [...Object.values(CoHostStatus)],
    default:  CoHostStatus.PENDING
  }
});
export const InviteCoHost = mongoose.model('inviteCoHost', CoHostInviteSchema);


// ================== PRIVATE EVENT JOIN REQUEST SCHEMA ====================
const eventJoinRequestSchema = new Schema<IEventJoinRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true},
  event: { type: Schema.Types.ObjectId, ref: 'user', required: true},
  approval: { type: String,  enum: [...Object.keys(EventJoinRequestType)], default: EventJoinRequestType.PENDING}
}, {
  versionKey: false,
  timestamps: true
});

export const EventJoinRequest = model<IEventJoinRequest>("event_join_request", eventJoinRequestSchema);




//===================== MAIN EVENT SCHEMA ========================
// Event Shcema
const eventSchema = new mongoose.Schema<IEvent>(
  {
    host: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    co_host: { type: Schema.Types.ObjectId, ref: 'user' },
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
      type: Boolean,
      default: false
      },
    sponsored: {type: String,
      enum: [...Object.values(ISponsored)],
      default: ISponsored.NORMAL
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
    location: { type: {
      type: String,
      enum: [...Object.values(LocationType)],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
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
  venue: 'text',
  'address.city': 'text'
});

// 2dsphere indexing
eventSchema.index({ location: '2dsphere'});


const Event = mongoose.model<IEvent>('event', eventSchema);
export default Event;
