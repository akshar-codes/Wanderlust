const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const listingCtrl = require("../controllers/listing.controller");

const isLoggedIn = require("../middlewares/isLoggedIn");
const isOwner = require("../middlewares/isOwner");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { listingBodySchema } = require("../validators/schemas");

// ── GET|POST /listings ────────────────────────────────────────────────────────
router
  .route("/")
  .get(asyncHandler(listingCtrl.index))
  .post(
    isLoggedIn,
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
    isOwner, // self-wrapping asyncHandler
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
