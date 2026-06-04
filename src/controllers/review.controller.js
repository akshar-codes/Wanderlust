const reviewService = require("../services/review.service");
const { sendSuccess } = require("../utils/apiResponse");

// ── POST /listings/:id/reviews ────────────────────────────────────────────────

const createReview = async (req, res) => {
  const { id } = req.params;

  const review = await reviewService.createReview(
    id,
    req.body.review,
    req.user._id,
  );

  req.flash("success", "New Review Created");
  if (req.accepts("html")) return res.redirect(`/listings/${id}`);
  return sendSuccess(res, { review }, 201);
};

// ── DELETE /listings/:id/reviews/:reviewID ────────────────────────────────────

const destroyReview = async (req, res) => {
  const { id, reviewID } = req.params;

  await reviewService.deleteReview(id, reviewID, req.user._id);

  req.flash("success", "Review Deleted");
  if (req.accepts("html")) return res.redirect(`/listings/${id}`);
  return sendSuccess(res, { deleted: true });
};

module.exports = { createReview, destroyReview };
