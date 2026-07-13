import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Wishlist (item) schema ────────────────────────────────────────────────────
const wishlistItemSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    collection: {
      type: Schema.Types.ObjectId,
      ref: "WishlistCollection",
      required: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [280, "Note cannot exceed 280 characters"],
      default: null,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
// A listing can only appear once within a given collection.
wishlistItemSchema.index({ collection: 1, listing: 1 }, { unique: true });
// Fast "is this listing saved anywhere by this user?" lookups.
wishlistItemSchema.index({ user: 1, listing: 1 });
// Fast paginated reads of a single collection's contents.
wishlistItemSchema.index({ collection: 1, createdAt: -1 });

const Wishlist = mongoose.model("Wishlist", wishlistItemSchema);

export default Wishlist;
