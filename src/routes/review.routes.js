const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const reviewCtrl = require("../controllers/review.controller.js");

const isLoggedIn = require("../middlewares/isLoggedIn.js");
const isReviewAuthor = require("../middlewares/isReviewAuthor.js");
const validateReview = require("../middlewares/validateReview.js");

// POST /listings/:id/reviews
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewCtrl.createReview),
);

// DELETE /listings/:id/reviews/:reviewID
router.delete(
  "/:reviewID",
  isLoggedIn,
  wrapAsync(isReviewAuthor),
  wrapAsync(reviewCtrl.destroyReview),
);

module.exports = router;
