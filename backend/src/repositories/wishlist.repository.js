import Wishlist from "../models/wishlist.js";

// ── Basic lookups ─────────────────────────────────────────────────────────────

export const find = (userId, listingId) =>
  Wishlist.findOne({ user: userId, listing: listingId });

export const create = (userId, listingId) =>
  Wishlist.create({ user: userId, listing: listingId });

export const deleteOne = (userId, listingId) =>
  Wishlist.findOneAndDelete({ user: userId, listing: listingId });

export const exists = (userId, listingId) =>
  Wishlist.exists({ user: userId, listing: listingId });

// ── Paginated listing ─────────────────────────────────────────────────────────

const LISTING_PROJECTION =
  "title location country price image category averageRating reviewCount status draft slug";

export const findPaginated = async (userId, { page = 1, limit = 12 } = {}) => {
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Wishlist.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "listing", select: LISTING_PROJECTION }),
    Wishlist.countDocuments({ user: userId }),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ── Stats ──────────────────────────────────────────────────────────────────────

export const countForListing = (listingId) =>
  Wishlist.countDocuments({ listing: listingId });
