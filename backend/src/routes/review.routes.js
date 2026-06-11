"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });

const asyncHandler = require("../utils/asyncHandler");
const reviewCtrl = require("../controllers/review.controller");
const validate = require("../middlewares/validate");
const { reviewBodySchema } = require("../validators/schemas");
const reviewRepo = require("../repositories/review.repository");

const {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} = require("../middlewares/rbac");

// ── Ownership fetch helper ────────────────────────────────────────────────────

const fetchReview = (req) => reviewRepo.findById(req.params.reviewId);

// ── Collection: GET + POST ─────────────────────────────────────────────────────

/**
 * GET  /api/listings/:listingId/reviews  → public
 * POST /api/listings/:listingId/reviews  → any authenticated user
 */
router
  .route("/")
  .get(asyncHandler(reviewCtrl.index))
  .post(
    requireAuth(),
    requirePermission("review", "create"),
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.create),
  );

// ── Single review: GET + PATCH + DELETE ────────────────────────────────────────

/**
 * GET    /api/listings/:listingId/reviews/:reviewId  → public
 * PATCH  /api/listings/:listingId/reviews/:reviewId  → auth + author (admin bypasses)
 * DELETE /api/listings/:listingId/reviews/:reviewId  → auth + author (admin bypasses)
 */
router
  .route("/:reviewId")
  .get(asyncHandler(reviewCtrl.show))
  .patch(
    requireAuth(),
    requirePermission("review", "update"),
    requireOwnerOrAdmin(fetchReview, "author", "Review"),
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.update),
  )
  .delete(
    requireAuth(),
    requirePermission("review", "delete"),
    requireOwnerOrAdmin(fetchReview, "author", "Review"),
    asyncHandler(reviewCtrl.destroy),
  );

module.exports = router;
