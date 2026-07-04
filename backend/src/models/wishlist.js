import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Wishlist schema ───────────────────────────────────────────────────────────
// One document per (user, listing) pair. Uniqueness is enforced at the DB
// level so concurrent toggle requests can't create duplicate saves.
const wishlistSchema = new Schema(
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
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
