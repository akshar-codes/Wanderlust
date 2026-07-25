import Listing from "../models/listing.js";

// ── Read ───────────────────────────────────────────────────────────────────────

export const findAll = (filter = {}, opts = {}) => {
  const { includeNonPublic = false, lean = false } = opts;

  const query = includeNonPublic
    ? filter
    : { ...filter, status: { $in: ["active"] }, draft: false };

  const q = Listing.find(query).sort({ createdAt: -1 });
  return lean ? q.lean() : q;
};

export const findPaginated = async (
  filter = {},
  {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    includeNonPublic = false,
  } = {},
) => {
  const baseFilter = includeNonPublic
    ? filter
    : { ...filter, status: "active", draft: false };

  const skip = (Number(page) - 1) * Number(limit);

  const [docs, total] = await Promise.all([
    Listing.find(baseFilter).sort(sort).skip(skip).limit(Number(limit)),
    Listing.countDocuments(baseFilter),
  ]);

  return { docs, total };
};

export const findByIdWithDetails = (id) =>
  Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

export const findBySlug = (slug, opts = {}) => {
  const { includeNonPublic = false } = opts;
  const filter = includeNonPublic
    ? { slug }
    : { slug, status: "active", draft: false };
  return Listing.findOne(filter)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
};

export const findById = (id) => Listing.findById(id);

export const findByOwner = (ownerId) =>
  Listing.find({ owner: ownerId }).sort({ createdAt: -1 });

export const findFeatured = (limit = 10) =>
  Listing.find({ featured: true, status: "active", draft: false })
    .sort({ averageRating: -1 })
    .limit(limit);

// ── Admin: listing moderation ──────────────────────────────────────────────────

/**
 * Paginated, filterable, searchable listing list for the Admin Listing
 * Moderation screen. Unlike the public-facing `findPaginated`, this
 * includes drafts and every status by default so admins can moderate
 * anything on the platform.
 */
export const findPaginatedAdmin = async ({
  page = 1,
  limit = 20,
  search,
  status,
  category,
  featured,
} = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (featured !== undefined) filter.featured = featured;
  if (search) filter.title = { $regex: search.trim(), $options: "i" };

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Listing.find(filter)
      .populate("owner", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ── Write ──────────────────────────────────────────────────────────────────────

export const create = (data) => Listing.create(data);

export const updateById = (id, updates) =>
  Listing.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

export const deleteById = (id) => Listing.findByIdAndDelete(id);

// ── Stats helpers ──────────────────────────────────────────────────────────────

export const recalculateRating = async (listingId) => {
  // Dynamic import avoids circular dependency between listing ↔ review models
  const { default: Review } = await import("../models/review.js");
  const listing = await Listing.findById(listingId).lean();
  if (!listing) return null;

  const stats = await Review.aggregate([
    { $match: { _id: { $in: listing.reviews } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const { averageRating = 0, reviewCount = 0 } = stats[0] ?? {};

  return Listing.findByIdAndUpdate(
    listingId,
    {
      $set: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
      },
    },
    { new: true },
  );
};

export const incrementCounter = (id, field, amount = 1) =>
  Listing.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });

// ── Images ─────────────────────────────────────────────────────────────────────

export const addImage = (id, imageData) =>
  Listing.findByIdAndUpdate(
    id,
    { $push: { images: imageData } },
    { new: true, runValidators: true },
  );

export const removeImage = (id, imageId) =>
  Listing.findByIdAndUpdate(
    id,
    { $pull: { images: { _id: imageId } } },
    { new: true },
  );

export const setPrimaryImage = async (listingId, imageId) => {
  await Listing.updateOne(
    { _id: listingId },
    { $set: { "images.$[].isPrimary": false } },
  );
  return Listing.findOneAndUpdate(
    { _id: listingId, "images._id": imageId },
    { $set: { "images.$.isPrimary": true } },
    { new: true },
  );
};

// ── Availability ───────────────────────────────────────────────────────────────

export const addBlockedDate = (id, blockedDate) =>
  Listing.findByIdAndUpdate(
    id,
    { $push: { availabilityCalendar: blockedDate } },
    { new: true, runValidators: true },
  );

export const removeBlockedDate = (id, blockedDateId) =>
  Listing.findByIdAndUpdate(
    id,
    { $pull: { availabilityCalendar: { _id: blockedDateId } } },
    { new: true },
  );
