const reviewService = require("../../services/review.service");
const reviewRepo = require("../../repositories/review.repository");
const AppError = require("../../utils/AppError");
const { sendSuccess } = require("../../utils/apiResponse");

// ── GET /api/listings/:listingId/reviews ──────────────────────────────────────
const index = async (req, res) => {
  const { listingId } = req.params;
  const listing =
    await require("../../repositories/listing.repository").findByIdWithDetails(
      listingId,
    );

  if (!listing)
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });

  return sendSuccess(res, { reviews: listing.reviews });
};

// ── GET /api/listings/:listingId/reviews/:reviewId ────────────────────────────
const show = async (req, res, next) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (!review) return next(AppError.notFound("Review not found"));
  return sendSuccess(res, { review });
};

// ── POST /api/listings/:listingId/reviews ─────────────────────────────────────
const create = async (req, res) => {
  const { listingId } = req.params;
  const review = await reviewService.createReview(
    listingId,
    req.body.review,
    req.user._id,
  );
  return sendSuccess(res, { review }, 201);
};

// ── PATCH /api/listings/:listingId/reviews/:reviewId ──────────────────────────
const update = async (req, res, next) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (!review) return next(AppError.notFound("Review not found"));

  const { rating, comment } = req.body.review ?? req.body;
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();
  return sendSuccess(res, { review });
};

// ── DELETE /api/listings/:listingId/reviews/:reviewId ─────────────────────────
const destroy = async (req, res) => {
  const { listingId, reviewId } = req.params;
  await reviewService.deleteReview(listingId, reviewId, req.user._id);
  return sendSuccess(res, { message: "Review deleted successfully" });
};

module.exports = { index, show, create, update, destroy };
