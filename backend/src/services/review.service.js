import * as reviewRepo from "../repositories/review.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import { cloudinary } from "../config/cloudConfig.js";
import AppError from "../utils/AppError.js";

// ── Create ────────────────────────────────────────────────────────────────────

export const createReview = async (listingId, reviewData, authorId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  const review = await reviewRepo.create({
    ...reviewData,
    author: authorId,
    listing: listingId,
  });

  await reviewRepo.addReviewToListing(listingId, review._id);
  await listingRepo.recalculateRating(listingId);

  return review;
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteReview = async (listingId, reviewId, authorId) => {
  const review = await reviewRepo.deleteByIdAndAuthor(reviewId, authorId);
  if (!review)
    throw AppError.forbidden("Review not found or you are not its author");

  await reviewRepo.removeReviewFromListing(listingId, reviewId);
  await listingRepo.recalculateRating(listingId);

  return review;
};

// ── Statistics ────────────────────────────────────────────────────────────────

export const getReviewStats = async (listingId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  return reviewRepo.getStats(listing._id);
};

// ── Paginated listing ─────────────────────────────────────────────────────────

export const getListingReviews = async (listingId, opts = {}) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  return reviewRepo.findPaginated(listing._id, opts);
};

// ── Reviews authored by a user — powers the dashboard "My Reviews" section ───

export const getMyReviews = (authorId, opts = {}) =>
  reviewRepo.findByAuthor(authorId, opts);

// ── Host reply ────────────────────────────────────────────────────────────────

export const upsertHostReply = async (listingId, reviewId, text, hostId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  if (!listing.owner.equals(hostId)) {
    throw AppError.forbidden("Only the listing owner can reply to reviews");
  }

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw AppError.notFound("Review not found");

  const isEdit = !!review.hostReply?.text;
  const updated = isEdit
    ? await reviewRepo.editHostReply(reviewId, text)
    : await reviewRepo.setHostReply(reviewId, text);

  return updated;
};

export const removeHostReply = async (listingId, reviewId, hostId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  if (!listing.owner.equals(hostId)) {
    throw AppError.forbidden("Only the listing owner can remove a reply");
  }

  return reviewRepo.deleteHostReply(reviewId);
};

// ── Helpfulness vote ──────────────────────────────────────────────────────────

export const toggleHelpfulVote = async (reviewId, userId) => {
  const review = await reviewRepo.findById(reviewId);
  if (!review) throw AppError.notFound("Review not found");
  return reviewRepo.voteHelpful(reviewId, userId);
};

// ── Photos ────────────────────────────────────────────────────────────────────

export const addReviewPhotos = async (reviewId, authorId, files) => {
  const review = await reviewRepo.findById(reviewId);
  if (!review) throw AppError.notFound("Review not found");
  if (!review.author._id.equals(authorId)) {
    throw AppError.forbidden("You can only add photos to your own reviews");
  }
  if ((review.photos?.length ?? 0) + files.length > 5) {
    throw AppError.badRequest("A review can have at most 5 photos");
  }

  const photos = files.map((f) => ({
    url: f.path,
    filename: f.filename,
    caption: null,
  }));

  return reviewRepo.addPhotos(reviewId, photos);
};

export const deleteReviewPhoto = async (reviewId, photoId, authorId) => {
  const review = await reviewRepo.findById(reviewId);
  if (!review) throw AppError.notFound("Review not found");
  if (!review.author._id.equals(authorId)) {
    throw AppError.forbidden(
      "You can only delete photos from your own reviews",
    );
  }

  const photo = review.photos?.id(photoId);
  if (!photo) throw AppError.notFound("Photo not found");

  if (photo.filename) {
    cloudinary.uploader.destroy(photo.filename).catch(() => {});
  }

  return reviewRepo.removePhoto(reviewId, photoId);
};
