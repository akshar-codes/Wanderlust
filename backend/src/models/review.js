import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Host reply sub-schema ─────────────────────────────────────────────────────
const hostReplySchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, "Reply cannot exceed 1000 characters"],
    },
    repliedAt: { type: Date, default: Date.now },
    editedAt: { type: Date, default: null },
  },
  { _id: false },
);

// ── Photo sub-schema ──────────────────────────────────────────────────────────
const reviewPhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    caption: { type: String, default: null, maxlength: 200 },
  },
  { _id: true },
);

// ── Main Review schema ────────────────────────────────────────────────────────
const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Category ratings (Airbnb-style sub-ratings)
    categoryRatings: {
      cleanliness: { type: Number, min: 1, max: 5, default: null },
      accuracy: { type: Number, min: 1, max: 5, default: null },
      checkIn: { type: Number, min: 1, max: 5, default: null },
      communication: { type: Number, min: 1, max: 5, default: null },
      location: { type: Number, min: 1, max: 5, default: null },
      value: { type: Number, min: 1, max: 5, default: null },
    },

    // Review photos (uploaded via Cloudinary)
    photos: {
      type: [reviewPhotoSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A review can have at most 5 photos",
      },
    },

    // Host reply
    hostReply: { type: hostReplySchema, default: null },

    // Helpfulness votes
    helpfulVotes: { type: Number, default: 0 },
    helpfulVoters: [{ type: Schema.Types.ObjectId, ref: "User" }],

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", index: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ listing: 1, rating: -1 });
reviewSchema.index({ author: 1, createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });

// ── Virtual: short summary of category ratings ────────────────────────────────
reviewSchema.virtual("hasDetailedRatings").get(function () {
  const cr = this.categoryRatings;
  return cr && Object.values(cr).some((v) => v !== null);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
