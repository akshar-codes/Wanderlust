import * as reviewRepo from "../repositories/review.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";

export const createReview = async (listingId, reviewData, authorId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  const review = await reviewRepo.create({ ...reviewData, author: authorId });

  await reviewRepo.addReviewToListing(listingId, review._id);

  await listingRepo.recalculateRating(listingId);

  return review;
};

export const deleteReview = async (listingId, reviewId, authorId) => {
  const review = await reviewRepo.deleteByIdAndAuthor(reviewId, authorId);
  if (!review) {
    throw AppError.forbidden("Review not found or you are not its author");
  }

  await reviewRepo.removeReviewFromListing(listingId, reviewId);

  await listingRepo.recalculateRating(listingId);

  return review;
};
