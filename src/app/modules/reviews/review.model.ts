import { model, Schema } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  event: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "event"
  },
  host: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  vote: {
    type: String,
    enum: ["UP", "DOWN"],
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false,
  timestamps: true
});

const Review = model<IReview>("review", reviewSchema);
export default Review;
