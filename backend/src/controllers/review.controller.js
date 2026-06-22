import * as reviewService from "../services/review.service.js";
import * as reviewRepo from "../repositories/review.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const index = async (req, res) => {
  const { listingId } = req.params;
  const listing = await listingRepo.findByIdWithDetails(listingId);

  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  return sendSuccess(res, { reviews: listing.reviews });
};

export const show = async (req, res, next) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (!review) return next(AppError.notFound("Review not found"));
  return sendSuccess(res, { review });
};

export const create = async (req, res) => {
  const { listingId } = req.params;
  const review = await reviewService.createReview(
    listingId,
    req.body.review,
    req.user._id,
  );
  return sendSuccess(res, { review }, 201);
};

export const update = async (req, res, next) => {
  const review = req.review ?? (await reviewRepo.findById(req.params.reviewId));
  if (!review) return next(AppError.notFound("Review not found"));

  const updates = req.body.review ?? req.body;
  if (updates.rating !== undefined) review.rating = updates.rating;
  if (updates.comment !== undefined) review.comment = updates.comment;

  await review.save();
  return sendSuccess(res, { review });
};

export const destroy = async (req, res) => {
  const { listingId, reviewId } = req.params;
  await reviewService.deleteReview(listingId, reviewId, req.user._id);
  return sendSuccess(res, { message: "Review deleted successfully" });
};
