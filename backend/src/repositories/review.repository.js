import Review from "../models/review.js";
import Listing from "../models/listing.js";

export const findById = (id) => Review.findById(id);

export const create = (data) => Review.create(data);

export const deleteByIdAndAuthor = (reviewId, authorId) =>
  Review.findOneAndDelete({ _id: reviewId, author: authorId });

export const addReviewToListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $push: { reviews: reviewId } });

export const removeReviewFromListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
