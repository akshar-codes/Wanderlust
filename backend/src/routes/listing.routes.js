"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const listingCtrl = require("../controllers/listing.controller");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isOwner = require("../middlewares/isOwner");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} = require("../validators/schemas");
const { createLimiter } = require("../config/rateLimiter.config");

// ── Collection routes ──────────────────────────────────────────────────────────

/**
 * GET  /api/listings          → list all (supports ?category, ?featured, ?propertyType,
 *                               ?minPrice, ?maxPrice, ?minGuests, ?page, ?limit, ?sort)
 * POST /api/listings          → create a listing (auth required)
 */
router
  .route("/")
  .get(asyncHandler(listingCtrl.index))
  .post(
    isLoggedIn,
    createLimiter,
    upload.single("listing[image]"),
    validate(listingBodySchema),
    asyncHandler(listingCtrl.create),
  );

// ── Static named routes (must precede /:id to avoid conflicts) ────────────────

/**
 * GET /api/listings/featured  → admin-curated featured listings
 */
router.get("/featured", asyncHandler(listingCtrl.featured));

/**
 * GET /api/listings/slug/:slug  → look up a listing by its URL slug
 */
router.get("/slug/:slug", asyncHandler(listingCtrl.showBySlug));

// ── Single-resource routes ─────────────────────────────────────────────────────

/**
 * GET    /api/listings/:id    → show a listing (populated reviews + owner)
 * PUT    /api/listings/:id    → full update  (auth + owner)
 * PATCH  /api/listings/:id    → partial update (auth + owner)
 * DELETE /api/listings/:id    → delete (auth + owner)
 */
router
  .route("/:id")
  .get(asyncHandler(listingCtrl.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validate(listingBodySchema),
    asyncHandler(listingCtrl.update),
  )
  .patch(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validate(listingPatchSchema),
    asyncHandler(listingCtrl.partialUpdate),
  )
  .delete(isLoggedIn, isOwner, asyncHandler(listingCtrl.destroy));

// ── Publish / draft management ─────────────────────────────────────────────────

/**
 * POST /api/listings/:id/publish    → make listing live  (auth + owner)
 * POST /api/listings/:id/unpublish  → move to draft      (auth + owner)
 */
router.post(
  "/:id/publish",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.publish),
);

router.post(
  "/:id/unpublish",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.unpublish),
);

// ── Featured (admin) ───────────────────────────────────────────────────────────

/**
 * PATCH /api/listings/:id/featured  → toggle featured flag (admin only)
 */
router.patch(
  "/:id/featured",
  isLoggedIn,
  asyncHandler(listingCtrl.setFeatured),
);

// ── Multi-image management ─────────────────────────────────────────────────────

/**
 * POST   /api/listings/:id/images                       → add images (auth + owner)
 * DELETE /api/listings/:id/images/:imageId              → remove image (auth + owner)
 * PATCH  /api/listings/:id/images/:imageId/primary      → set primary image (auth + owner)
 */
router.post(
  "/:id/images",
  isLoggedIn,
  isOwner,
  upload.array("images", 10),
  asyncHandler(listingCtrl.addImages),
);

router.delete(
  "/:id/images/:imageId",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.removeImage),
);

router.patch(
  "/:id/images/:imageId/primary",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.setPrimaryImage),
);

// ── Availability calendar ──────────────────────────────────────────────────────

/**
 * POST   /api/listings/:id/availability                  → block dates (auth + owner)
 * DELETE /api/listings/:id/availability/:blockedDateId   → unblock dates (auth + owner)
 */
router.post(
  "/:id/availability",
  isLoggedIn,
  isOwner,
  validate(blockedDateSchema),
  asyncHandler(listingCtrl.addBlockedDate),
);

router.delete(
  "/:id/availability/:blockedDateId",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.removeBlockedDate),
);

module.exports = router;
