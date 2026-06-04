const reviewRepo = require("../repositories/review.repository.js");
const listingRepo = require("../repositories/listing.repository.js");

// ─── Write ───────────────────────────────────────────────────────────────────

const createReview = async (listingId, reviewData, authorId) => {
  // Guard: ensure the listing still exists
  const listing = await listingRepo.findById(listingId);
  if (!listing) {
    const err = new Error("Listing not found");
    err.statusCode = 404;
    throw err;
  }

  // Persist the review
  const review = await reviewRepo.create({ ...reviewData, author: authorId });

  // Link the review to the listing
  await reviewRepo.addReviewToListing(listingId, review._id);

  return review;
};

const deleteReview = async (listingId, reviewId, authorId) => {
  const review = await reviewRepo.deleteByIdAndAuthor(reviewId, authorId);
  if (!review) {
    const err = new Error("Review not found or not authorised");
    err.statusCode = 403;
    throw err;
  }

  // Unlink from listing (fire-and-forget is acceptable here; both docs
  // are owned by the same transaction-less MongoDB instance)
  await reviewRepo.removeReviewFromListing(listingId, reviewId);

  return review;
};

module.exports = {
  createReview,
  deleteReview,
};
