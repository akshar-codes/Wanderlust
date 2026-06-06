"use strict";

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const reviewRepo = require("../repositories/review.repository");

module.exports = asyncHandler(async (req, _res, next) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (!review) return next(AppError.notFound("Review not found"));

  if (!review.author.equals(req.user._id)) {
    return next(AppError.forbidden("You are not the author of this review"));
  }

  // Attach for downstream reuse
  req.review = review;
  next();
});
