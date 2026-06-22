import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as listingCtrl from "../controllers/listing.controller.js";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validate.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
import {
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} from "../validators/index.js";
import { createLimiter } from "../config/rateLimiter.config.js";
import * as listingRepo from "../repositories/listing.repository.js";
import {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} from "../middlewares/rbac.js";

const router = express.Router();

const fetchListing = (req) => listingRepo.findById(req.params.id);

// ── Collection ────────────────────────────────────────────────────────────────

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

// ── Named static routes ────────────────────────────────────────────────────────

router.get("/featured", asyncHandler(listingCtrl.featured));
router.get("/slug/:slug", asyncHandler(listingCtrl.showBySlug));

// ── Single resource ────────────────────────────────────────────────────────────

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
  requirePermission("listing", "feature"),
  asyncHandler(listingCtrl.setFeatured),
);

// ── Images ─────────────────────────────────────────────────────────────────────

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

// ── Availability ───────────────────────────────────────────────────────────────

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

export default router;
