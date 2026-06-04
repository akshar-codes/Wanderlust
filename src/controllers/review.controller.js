const reviewService = require("../services/review.service.js");

// ─── POST /listings/:id/reviews ───────────────────────────────────────────────

const createReview = async (req, res) => {
  const { id } = req.params;

  await reviewService.createReview(id, req.body.review, req.user._id);

  req.flash("success", "New Review Created");
  res.redirect(`/listings/${id}`);
};

// ─── DELETE /listings/:id/reviews/:reviewID ───────────────────────────────────

const destroyReview = async (req, res) => {
  const { id, reviewID } = req.params;

  await reviewService.deleteReview(id, reviewID, req.user._id);

  req.flash("success", "Review Deleted");
  res.redirect(`/listings/${id}`);
};

module.exports = {
  createReview,
  destroyReview,
};
