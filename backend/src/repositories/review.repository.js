import Review from "../models/review.js";
import Listing from "../models/listing.js";

// ── Basic CRUD ────────────────────────────────────────────────────────────────

export const findById = (id) =>
  Review.findById(id).populate("author", "username firstName lastName avatar");

export const create = (data) => Review.create(data);

export const deleteByIdAndAuthor = (reviewId, authorId) =>
  Review.findOneAndDelete({ _id: reviewId, author: authorId });

/**
 * Admin-only hard delete, bypassing author ownership. Used by review
 * moderation and by report resolution (`content_removed` on a review).
 */
export const deleteById = (id) => Review.findByIdAndDelete(id);

export const addReviewToListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $push: { reviews: reviewId } });

export const removeReviewFromListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });

// ── Paginated + filtered listing reviews ─────────────────────────────────────

const SORT_MAP = {
  recent: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highest: { rating: -1 },
  lowest: { rating: 1 },
  helpful: { helpfulVotes: -1, createdAt: -1 },
  photos: { "photos.0": -1, createdAt: -1 }, // reviews with photos first
};

export const findPaginated = async (
  listingId,
  {
    page = 1,
    limit = 10,
    sort = "recent",
    ratingFilter,
    withPhotos,
    keyword,
  } = {},
) => {
  const baseMatch = { listing: listingId };
  if (ratingFilter) baseMatch.rating = Number(ratingFilter);
  if (withPhotos) baseMatch["photos.0"] = { $exists: true };
  if (keyword) {
    baseMatch.comment = { $regex: keyword.trim(), $options: "i" };
  }

  const sortDoc = SORT_MAP[sort] ?? SORT_MAP.recent;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Review.find(baseMatch)
      .sort(sortDoc)
      .skip(skip)
      .limit(limit)
      .populate("author", "username firstName lastName avatar"),
    Review.countDocuments(baseMatch),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ── Reviews authored by a given user (across all listings) ───────────────────
// Powers the "My Reviews" section of the user dashboard.

export const findByAuthor = async (authorId, { page = 1, limit = 10 } = {}) => {
  const filter = { author: authorId };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "listing",
        select: "title location country image slug",
      }),
    Review.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ── Reviews received on a host's listings (across all their listings) ────────
// Powers the public/self "Reviews" section on the user profile page.

export const findByListingOwnerPaginated = async (
  ownerId,
  { page = 1, limit = 10 } = {},
) => {
  const ownedListingIds = await Listing.find(
    { owner: ownerId },
    { _id: 1 },
  ).lean();
  const ids = ownedListingIds.map((l) => l._id);

  if (ids.length === 0) {
    return { docs: [], total: 0, page, limit, totalPages: 0 };
  }

  const filter = { listing: { $in: ids } };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username firstName lastName avatar")
      .populate({ path: "listing", select: "title slug image" }),
    Review.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Aggregate rating/count summary across every listing a user owns.
 * Used for the profile page's host statistics cards.
 */
export const getHostReviewSummary = async (ownerId) => {
  const ownedListingIds = await Listing.find(
    { owner: ownerId },
    { _id: 1 },
  ).lean();
  const ids = ownedListingIds.map((l) => l._id);

  if (ids.length === 0) {
    return { totalReviews: 0, averageRating: 0 };
  }

  const [result] = await Review.aggregate([
    { $match: { listing: { $in: ids } } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return {
    totalReviews: result?.totalReviews ?? 0,
    averageRating: result?.averageRating
      ? Math.round(result.averageRating * 10) / 10
      : 0,
  };
};

// ── Admin: review moderation ──────────────────────────────────────────────────

/**
 * Paginated, filterable, searchable review list across the entire platform
 * for the Admin Review Moderation screen.
 */
export const findPaginatedAdmin = async ({
  page = 1,
  limit = 20,
  rating,
  search,
} = {}) => {
  const filter = {};
  if (rating) filter.rating = Number(rating);
  if (search) filter.comment = { $regex: search.trim(), $options: "i" };

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .populate("author", "username email firstName lastName")
      .populate({ path: "listing", select: "title slug owner" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ── Statistics aggregation (single listing) ───────────────────────────────────

export const getStats = async (listingId) => {
  const [stats] = await Review.aggregate([
    { $match: { listing: listingId } },
    {
      $facet: {
        // Overall stats + category rating averages
        overview: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avg: { $avg: "$rating" },
              sum: { $sum: "$rating" },
              avgCleanliness: { $avg: "$categoryRatings.cleanliness" },
              avgAccuracy: { $avg: "$categoryRatings.accuracy" },
              avgCheckIn: { $avg: "$categoryRatings.checkIn" },
              avgCommunication: { $avg: "$categoryRatings.communication" },
              avgLocation: { $avg: "$categoryRatings.location" },
              avgValue: { $avg: "$categoryRatings.value" },
              photoCount: {
                $sum: {
                  $cond: [
                    { $gt: [{ $size: { $ifNull: ["$photos", []] } }, 0] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],

        // Rating distribution (1–5)
        distribution: [
          { $group: { _id: "$rating", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
        ],

        // Recent trend: last 5 reviews
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $group: { _id: null, recentAvg: { $avg: "$rating" } } },
        ],
      },
    },
  ]);

  if (!stats) {
    return {
      count: 0,
      average: 0,
      distribution: [],
      categoryAverages: {},
      photoReviewCount: 0,
      recentAverage: null,
    };
  }

  const ov = stats.overview[0] ?? {};
  const totalReviews = ov.count ?? 0;

  // Build distribution with percentages
  const distMap = {};
  (stats.distribution ?? []).forEach((d) => {
    distMap[d._id] = d.count;
  });
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: distMap[star] ?? 0,
    pct:
      totalReviews > 0
        ? Math.round(((distMap[star] ?? 0) / totalReviews) * 100)
        : 0,
  }));

  // Category averages — round to 1 decimal, omit nulls
  const round1 = (v) => (v != null ? Math.round(v * 10) / 10 : null);
  const categoryAverages = {
    cleanliness: round1(ov.avgCleanliness),
    accuracy: round1(ov.avgAccuracy),
    checkIn: round1(ov.avgCheckIn),
    communication: round1(ov.avgCommunication),
    location: round1(ov.avgLocation),
    value: round1(ov.avgValue),
  };

  return {
    count: totalReviews,
    average: totalReviews > 0 ? Math.round((ov.avg ?? 0) * 10) / 10 : 0,
    distribution,
    categoryAverages,
    photoReviewCount: ov.photoCount ?? 0,
    recentAverage:
      stats.recent[0]?.recentAvg != null
        ? Math.round(stats.recent[0].recentAvg * 10) / 10
        : null,
  };
};

// ── Host reply ────────────────────────────────────────────────────────────────

export const setHostReply = (reviewId, text) =>
  Review.findByIdAndUpdate(
    reviewId,
    {
      $set: {
        "hostReply.text": text,
        "hostReply.repliedAt": text ? new Date() : null,
        "hostReply.editedAt": null,
      },
    },
    { new: true },
  );

export const editHostReply = (reviewId, text) =>
  Review.findByIdAndUpdate(
    reviewId,
    {
      $set: {
        "hostReply.text": text,
        "hostReply.editedAt": new Date(),
      },
    },
    { new: true },
  );

export const deleteHostReply = (reviewId) =>
  Review.findByIdAndUpdate(
    reviewId,
    { $set: { hostReply: null } },
    { new: true },
  );

// ── Helpfulness voting ────────────────────────────────────────────────────────

export const voteHelpful = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  const hasVoted = review.helpfulVoters.some((v) => v.equals(userId));
  if (hasVoted) {
    // Toggle off
    return Review.findByIdAndUpdate(
      reviewId,
      {
        $inc: { helpfulVotes: -1 },
        $pull: { helpfulVoters: userId },
      },
      { new: true },
    );
  } else {
    return Review.findByIdAndUpdate(
      reviewId,
      {
        $inc: { helpfulVotes: 1 },
        $addToSet: { helpfulVoters: userId },
      },
      { new: true },
    );
  }
};

// ── Photos ────────────────────────────────────────────────────────────────────

export const addPhotos = (reviewId, photos) =>
  Review.findByIdAndUpdate(
    reviewId,
    { $push: { photos: { $each: photos } } },
    { new: true },
  );

export const removePhoto = (reviewId, photoId) =>
  Review.findByIdAndUpdate(
    reviewId,
    { $pull: { photos: { _id: photoId } } },
    { new: true },
  );
