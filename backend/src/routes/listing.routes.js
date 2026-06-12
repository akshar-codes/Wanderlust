"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const listingCtrl = require("../controllers/listing.controller");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { requireVerifiedEmail } = require("../middlewares/requireVerifiedEmail");
const {
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} = require("../validators/schemas");
const { createLimiter } = require("../config/rateLimiter.config");
const listingRepo = require("../repositories/listing.repository");

const {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} = require("../middlewares/rbac");

// ── Ownership fetch helper ────────────────────────────────────────────────────

const fetchListing = (req) => listingRepo.findById(req.params.id);

// ── Collection routes ──────────────────────────────────────────────────────────

/**
 * GET  /api/listings          → public
 * POST /api/listings          → host | admin only
 */
router
  .route("/")
  .get(asyncHandler(listingCtrl.index))
  .post(
    requireAuth(),
    requireVerifiedEmail(),
    requirePermission("listing", "create"),
    createLimiter,
    upload.single("listing[image]"),
    validate(listingBodySchema),
    asyncHandler(listingCtrl.create),
  );

// ── Static named routes ────────────────────────────────────────────────────────

router.get("/featured", asyncHandler(listingCtrl.featured));
router.get("/slug/:slug", asyncHandler(listingCtrl.showBySlug));

// ── Single-resource routes ─────────────────────────────────────────────────────

/**
 * GET    /api/listings/:id    → public
 * PUT    /api/listings/:id    → auth + owner (host|admin can update, admin bypasses ownership)
 * PATCH  /api/listings/:id    → auth + owner
 * DELETE /api/listings/:id    → auth + owner
 */
router
  .route("/:id")
  .get(asyncHandler(listingCtrl.show))
  .put(
    requireAuth(),
    requirePermission("listing", "update"),
    requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
    upload.single("listing[image]"),
    validate(listingBodySchema),
    asyncHandler(listingCtrl.update),
  )
  .patch(
    requireAuth(),
    requirePermission("listing", "update"),
    requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
    upload.single("listing[image]"),
    validate(listingPatchSchema),
    asyncHandler(listingCtrl.partialUpdate),
  )
  .delete(
    requireAuth(),
    requirePermission("listing", "delete"),
    requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
    asyncHandler(listingCtrl.destroy),
  );

// ── Publish / draft ────────────────────────────────────────────────────────────

router.post(
  "/:id/publish",
  requireAuth(),
  requirePermission("listing", "publish"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  asyncHandler(listingCtrl.publish),
);

router.post(
  "/:id/unpublish",
  requireAuth(),
  requirePermission("listing", "unpublish"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  asyncHandler(listingCtrl.unpublish),
);

// ── Featured (admin only) ──────────────────────────────────────────────────────

router.patch(
  "/:id/featured",
  requireAuth(),
  requirePermission("listing", "feature"), // admin only — no ownership check needed
  asyncHandler(listingCtrl.setFeatured),
);

// ── Multi-image management ─────────────────────────────────────────────────────

router.post(
  "/:id/images",
  requireAuth(),
  requirePermission("listing", "manageImages"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  upload.array("images", 10),
  asyncHandler(listingCtrl.addImages),
);

router.delete(
  "/:id/images/:imageId",
  requireAuth(),
  requirePermission("listing", "manageImages"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  asyncHandler(listingCtrl.removeImage),
);

router.patch(
  "/:id/images/:imageId/primary",
  requireAuth(),
  requirePermission("listing", "manageImages"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  asyncHandler(listingCtrl.setPrimaryImage),
);

// ── Availability calendar ──────────────────────────────────────────────────────

router.post(
  "/:id/availability",
  requireAuth(),
  requirePermission("listing", "manageAvailability"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  validate(blockedDateSchema),
  asyncHandler(listingCtrl.addBlockedDate),
);

router.delete(
  "/:id/availability/:blockedDateId",
  requireAuth(),
  requirePermission("listing", "manageAvailability"),
  requireOwnerOrAdmin(fetchListing, "owner", "Listing"),
  asyncHandler(listingCtrl.removeBlockedDate),
);

module.exports = router;
