import mongoose from "mongoose";

const { Schema } = mongoose;

// ── WishlistCollection schema ─────────────────────────────────────────────────

const wishlistCollectionSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
      default: "My Wishlist",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: null,
    },
    // Auto-derived from the most recently saved listing's image; kept
    // denormalized so the wishlist grid never needs an extra populate.
    coverImage: {
      type: String,
      default: null,
    },
    // Exactly one default collection per user — created lazily on first save
    // and cannot be renamed away from being the "catch-all" list or deleted.
    isDefault: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: {
        values: ["private", "shared"],
        message: "Visibility must be either private or shared",
      },
      default: "private",
    },
    // Opaque random token used to build a public read-only share URL.
    // Null while private; regenerated each time sharing is re-enabled so a
    // previously-shared (and later revoked) link can never be reused.
    shareToken: {
      type: String,
      default: null,
    },
    // Denormalized count of items in this collection — avoids a separate
    // aggregation query every time collections are listed.
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
wishlistCollectionSchema.index({ owner: 1, isDefault: 1 });
wishlistCollectionSchema.index({ owner: 1, createdAt: -1 });
wishlistCollectionSchema.index(
  { shareToken: 1 },
  { unique: true, sparse: true },
);

const WishlistCollection = mongoose.model(
  "WishlistCollection",
  wishlistCollectionSchema,
);

export default WishlistCollection;
