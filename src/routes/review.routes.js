const express = require("express");
const router = express.Router({ mergeParams: true });

const asyncHandler = require("../utils/asyncHandler");
const reviewCtrl = require("../controllers/review.controller");

const isLoggedIn = require("../middlewares/isLoggedIn");
const isReviewAuthor = require("../middlewares/isReviewAuthor");
const validate = require("../middlewares/validate");
const { reviewBodySchema } = require("../validators/schemas");

// ── POST /listings/:id/reviews ────────────────────────────────────────────────
router.post(
  "/",
  isLoggedIn,
  validate(reviewBodySchema),
  asyncHandler(reviewCtrl.createReview),
);

// ── DELETE /listings/:id/reviews/:reviewID ────────────────────────────────────
router.delete(
  "/:reviewID",
  isLoggedIn,
  isReviewAuthor, // self-wrapping asyncHandler
  asyncHandler(reviewCtrl.destroyReview),
);

module.exports = router;
