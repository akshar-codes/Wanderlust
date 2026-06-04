const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const listingCtrl = require("../controllers/listing.controller");

const isLoggedIn = require("../middlewares/isLoggedIn");
const isOwner = require("../middlewares/isOwner");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { listingBodySchema } = require("../validators/schemas");
const { createLimiter } = require("../config/rateLimiter.config");

// ── GET|POST /listings ────────────────────────────────────────────────────────
router.route("/").get(asyncHandler(listingCtrl.index)).post(
  isLoggedIn,
  createLimiter, // max 30 creates/hour per IP
  upload.single("listing[image]"),
  validate(listingBodySchema),
  asyncHandler(listingCtrl.createListing),
);

// ── GET /listings/new ─────────────────────────────────────────────────────────
// Must be defined BEFORE /:id so "new" is not treated as an ObjectId
router.get("/new", isLoggedIn, listingCtrl.renderNewForm);

// ── GET|PUT|DELETE /listings/:id ──────────────────────────────────────────────
router
  .route("/:id")
  .get(asyncHandler(listingCtrl.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validate(listingBodySchema),
    asyncHandler(listingCtrl.updateListing),
  )
  .delete(isLoggedIn, isOwner, asyncHandler(listingCtrl.destroyListing));

// ── GET /listings/:id/edit ────────────────────────────────────────────────────
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  asyncHandler(listingCtrl.renderEditForm),
);

module.exports = router;
