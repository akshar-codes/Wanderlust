const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const reviewRepo = require("../repositories/review.repository");

module.exports = asyncHandler(async (req, res, next) => {
  const { id, reviewID } = req.params;

  const review = await reviewRepo.findById(reviewID);
  if (!review) return next(AppError.notFound("Review not found"));

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    if (req.accepts("html")) return res.redirect(`/listings/${id}`);
    return next(AppError.forbidden("You are not the author of this review"));
  }

  next();
});
