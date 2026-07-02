import * as reviewService from "../services/review.service.js";
import * as reviewRepo from "../repositories/review.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── GET /api/listings/:listingId/reviews ──────────────────────────────────────

export const index = async (req, res) => {
  const { listingId } = req.params;
  const {
    page = 1,
    limit = 10,
    sort = "recent",
    rating,
    withPhotos,
    keyword,
  } = req.query;

  const result = await reviewService.getListingReviews(listingId, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
    sort,
    ratingFilter: rating ? Number(rating) : undefined,
    withPhotos: withPhotos === "true" ? true : undefined,
    keyword,
  });

  return sendSuccess(res, {
    reviews: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1,
    },
  });
};

// ── GET /api/listings/:listingId/reviews/stats ────────────────────────────────

export const stats = async (req, res) => {
  const { listingId } = req.params;
  const data = await reviewService.getReviewStats(listingId);
  return sendSuccess(res, data);
};

// ── GET /api/listings/:listingId/reviews/:reviewId ────────────────────────────

export const show = async (req, res, next) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (!review) return next(AppError.notFound("Review not found"));
  return sendSuccess(res, { review });
};

// ── POST /api/listings/:listingId/reviews ────────────────────────────────────

export const create = async (req, res) => {
  const { listingId } = req.params;
  const review = await reviewService.createReview(
    listingId,
    req.body.review,
    req.user._id,
  );
  return sendSuccess(res, { review }, 201);
};

// ── PATCH /api/listings/:listingId/reviews/:reviewId ─────────────────────────

export const update = async (req, res, next) => {
  const review = req.review ?? (await reviewRepo.findById(req.params.reviewId));
  if (!review) return next(AppError.notFound("Review not found"));

  const updates = req.body.review ?? req.body;
  if (updates.rating !== undefined) review.rating = updates.rating;
  if (updates.comment !== undefined) review.comment = updates.comment;
  if (updates.categoryRatings !== undefined)
    review.categoryRatings = updates.categoryRatings;
  review.updatedAt = new Date();

  await review.save();
  return sendSuccess(res, { review });
};

// ── DELETE /api/listings/:listingId/reviews/:reviewId ────────────────────────

export const destroy = async (req, res) => {
  const { listingId, reviewId } = req.params;
  await reviewService.deleteReview(listingId, reviewId, req.user._id);
  return sendSuccess(res, { message: "Review deleted successfully" });
};

// ── POST .../reviews/:reviewId/reply (host only) ──────────────────────────────

export const upsertReply = async (req, res, next) => {
  const { listingId, reviewId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(AppError.badRequest("Reply text is required"));
  }
  if (text.length > 1000) {
    return next(AppError.badRequest("Reply cannot exceed 1000 characters"));
  }

  const updated = await reviewService.upsertHostReply(
    listingId,
    reviewId,
    text.trim(),
    req.user._id,
  );
  return sendSuccess(res, { review: updated });
};

// ── DELETE .../reviews/:reviewId/reply ────────────────────────────────────────

export const deleteReply = async (req, res) => {
  const { listingId, reviewId } = req.params;
  const updated = await reviewService.removeHostReply(
    listingId,
    reviewId,
    req.user._id,
  );
  return sendSuccess(res, { review: updated });
};

// ── POST .../reviews/:reviewId/helpful ───────────────────────────────────────

export const toggleHelpful = async (req, res) => {
  const updated = await reviewService.toggleHelpfulVote(
    req.params.reviewId,
    req.user._id,
  );
  return sendSuccess(res, {
    helpfulVotes: updated.helpfulVotes,
    voted: updated.helpfulVoters.some((v) => v.equals(req.user._id)),
  });
};

// ── POST .../reviews/:reviewId/photos ─────────────────────────────────────────

export const addPhotos = async (req, res, next) => {
  if (!req.files?.length) {
    return next(AppError.badRequest("No photos provided"));
  }
  const updated = await reviewService.addReviewPhotos(
    req.params.reviewId,
    req.user._id,
    req.files,
  );
  return sendSuccess(res, { review: updated }, 201);
};

// ── DELETE .../reviews/:reviewId/photos/:photoId ──────────────────────────────

export const deletePhoto = async (req, res) => {
  const updated = await reviewService.deleteReviewPhoto(
    req.params.reviewId,
    req.params.photoId,
    req.user._id,
  );
  return sendSuccess(res, { review: updated });
};
