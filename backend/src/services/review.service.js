"use strict";

const reviewRepo = require("../repositories/review.repository.js");
const listingRepo = require("../repositories/listing.repository.js");
const AppError = require("../utils/AppError.js");

// ── Write ───────────────────────────────────────────────────────────────────────

const createReview = async (listingId, reviewData, authorId) => {
  // Guard: ensure the listing exists and is publicly visible
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  // Persist the review
  const review = await reviewRepo.create({ ...reviewData, author: authorId });

  // Link the review to the listing
  await reviewRepo.addReviewToListing(listingId, review._id);

  // Recalculate cached averageRating + reviewCount on the listing
  await listingRepo.recalculateRating(listingId);

  return review;
};

const deleteReview = async (listingId, reviewId, authorId) => {
  const review = await reviewRepo.deleteByIdAndAuthor(reviewId, authorId);
  if (!review) {
    throw AppError.forbidden("Review not found or you are not its author");
  }

  // Unlink from listing
  await reviewRepo.removeReviewFromListing(listingId, reviewId);

  // Recalculate cached stats after deletion
  await listingRepo.recalculateRating(listingId);

  return review;
};

module.exports = {
  createReview,
  deleteReview,
};
