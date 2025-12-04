import { model, Schema } from "mongoose";
import { IReview } from "./review.interface";


const reviewSchema = new Schema<IReview>({
    user: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    event: {type: Schema.Types.ObjectId, required: true, ref: "event"},
    rating: {type: Number},
    comment: {type: String}
}, {
    versionKey: false,
    timestamps: true
});


const Review = model<IReview>('review', reviewSchema);

export default Review;