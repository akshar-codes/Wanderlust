const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const findById = (id) => Review.findById(id);

const create = (data) => Review.create(data);

const deleteByIdAndAuthor = (reviewId, authorId) =>
  Review.findOneAndDelete({ _id: reviewId, author: authorId });

const addReviewToListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $push: { reviews: reviewId } });

const removeReviewFromListing = (listingId, reviewId) =>
  Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });

module.exports = {
  findById,
  create,
  deleteByIdAndAuthor,
  addReviewToListing,
  removeReviewFromListing,
};
