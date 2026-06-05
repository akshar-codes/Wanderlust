const express = require("express");
const router = express.Router({ mergeParams: true });

const asyncHandler = require("../../utils/asyncHandler");
const reviewCtrl = require("../controllers/review.controller");
const isLoggedIn = require("../middlewares/isLoggedIn.api");
const isReviewAuthor = require("../middlewares/isReviewAuthor.api");
const validate = require("../../middlewares/validate");
const { reviewBodySchema } = require("../../validators/schemas");

/**
 * GET  /api/listings/:listingId/reviews       → all reviews for a listing
 * POST /api/listings/:listingId/reviews       → add a review (auth required)
 */
router
  .route("/")
  .get(asyncHandler(reviewCtrl.index))
  .post(
    isLoggedIn,
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.create),
  );

/**
 * GET    /api/listings/:listingId/reviews/:reviewId  → single review
 * PATCH  /api/listings/:listingId/reviews/:reviewId  → update (auth + author)
 * DELETE /api/listings/:listingId/reviews/:reviewId  → delete (auth + author)
 */
router
  .route("/:reviewId")
  .get(asyncHandler(reviewCtrl.show))
  .patch(
    isLoggedIn,
    isReviewAuthor,
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.update),
  )
  .delete(isLoggedIn, isReviewAuthor, asyncHandler(reviewCtrl.destroy));

module.exports = router;
