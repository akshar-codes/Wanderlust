import Wishlist from "../models/wishlist.js";

const LISTING_PROJECTION =
  "title location country price image category averageRating reviewCount status draft slug";

// ── Basic lookups ─────────────────────────────────────────────────────────────

export const findInCollection = (collectionId, listingId) =>
  Wishlist.findOne({ collection: collectionId, listing: listingId });

/** Every saved-item row for this (user, listing) pair, across all of the
 * user's collections — used to compute which wishlists a listing is in. */
export const findAnyForUserListing = (userId, listingId) =>
  Wishlist.find({ user: userId, listing: listingId }).select("collection");

export const create = (data) => Wishlist.create(data);

export const deleteOne = (collectionId, listingId) =>
  Wishlist.findOneAndDelete({ collection: collectionId, listing: listingId });

export const deleteAllForCollection = (collectionId) =>
  Wishlist.deleteMany({ collection: collectionId });

export const moveItem = (itemId, toCollectionId) =>
  Wishlist.findByIdAndUpdate(
    itemId,
    { $set: { collection: toCollectionId } },
    { new: true },
  );

// ── Paginated reads ────────────────────────────────────────────────────────────

export const findPaginatedByCollection = async (
  collectionId,
  { page = 1, limit = 12 } = {},
) => {
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Wishlist.find({ collection: collectionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "listing", select: LISTING_PROJECTION }),
    Wishlist.countDocuments({ collection: collectionId }),
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
