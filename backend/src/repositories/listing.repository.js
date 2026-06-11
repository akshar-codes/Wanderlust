"use strict";

const Listing = require("../models/listing.js");

// ── Read ───────────────────────────────────────────────────────────────────────

const findAll = (filter = {}, opts = {}) => {
  const { includeNonPublic = false, lean = false } = opts;

  const query = includeNonPublic
    ? filter
    : { ...filter, status: { $in: ["active"] }, draft: false };

  const q = Listing.find(query).sort({ createdAt: -1 });
  return lean ? q.lean() : q;
};

/**
 * Paginated find — returns documents + total count in one round-trip.
 */
const findPaginated = async (
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

/**
 * Find a listing by ID and populate reviews + owner for detail views.
 */
const findByIdWithDetails = (id) =>
  Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

/**
 * Find a listing by its slug (public-facing URLs).
 */
const findBySlug = (slug, opts = {}) => {
  const { includeNonPublic = false } = opts;
  const filter = includeNonPublic
    ? { slug }
    : { slug, status: "active", draft: false };
  return Listing.findOne(filter)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
};

const findById = (id) => Listing.findById(id);

const findByOwner = (ownerId) =>
  Listing.find({ owner: ownerId }).sort({ createdAt: -1 });

const findFeatured = (limit = 10) =>
  Listing.find({ featured: true, status: "active", draft: false })
    .sort({ averageRating: -1 })
    .limit(limit);

// ── Write ──────────────────────────────────────────────────────────────────────

const create = (data) => Listing.create(data);

const updateById = (id, updates) =>
  Listing.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const deleteById = (id) => Listing.findByIdAndDelete(id);

// ── Stats helpers ──────────────────────────────────────────────────────────────

const recalculateRating = async (listingId) => {
  const Review = require("../models/review.js");
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

/**
 * Increment a numeric counter field (bookingCount, wishlistCount, etc.).
 */
const incrementCounter = (id, field, amount = 1) =>
  Listing.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });

// ── Images ─────────────────────────────────────────────────────────────────────

/**
 * Add an image to the images[] array.
 */
const addImage = (id, imageData) =>
  Listing.findByIdAndUpdate(
    id,
    { $push: { images: imageData } },
    { new: true, runValidators: true },
  );

/**
 * Remove an image from the images[] array by its sub-document _id.
 */
const removeImage = (id, imageId) =>
  Listing.findByIdAndUpdate(
    id,
    { $pull: { images: { _id: imageId } } },
    { new: true },
  );

/**
 * Set a specific image as primary (clears others first).
 */
const setPrimaryImage = async (listingId, imageId) => {
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

const addBlockedDate = (id, blockedDate) =>
  Listing.findByIdAndUpdate(
    id,
    { $push: { availabilityCalendar: blockedDate } },
    { new: true, runValidators: true },
  );

const removeBlockedDate = (id, blockedDateId) =>
  Listing.findByIdAndUpdate(
    id,
    { $pull: { availabilityCalendar: { _id: blockedDateId } } },
    { new: true },
  );

module.exports = {
  findAll,
  findPaginated,
  findByIdWithDetails,
  findBySlug,
  findById,
  findByOwner,
  findFeatured,
  create,
  updateById,
  deleteById,
  recalculateRating,
  incrementCounter,
  addImage,
  removeImage,
  setPrimaryImage,
  addBlockedDate,
  removeBlockedDate,
};
