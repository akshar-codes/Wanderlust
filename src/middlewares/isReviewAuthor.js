const reviewRepo = require("../repositories/review.repository.js");

module.exports = async (req, res, next) => {
  const { id, reviewID } = req.params;

  const review = await reviewRepo.findById(reviewID);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
