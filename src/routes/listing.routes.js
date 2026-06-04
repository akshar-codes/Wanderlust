const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingCtrl = require("../controllers/listing.controller.js");

const isLoggedIn = require("../middlewares/isLoggedIn.js");
const isOwner = require("../middlewares/isOwner.js");
const validateListing = require("../middlewares/validateListing.js");
const upload = require("../middlewares/upload.js");

// ─── /listings ────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(wrapAsync(listingCtrl.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingCtrl.createListing),
  );

// ─── /listings/new ────────────────────────────────────────────────────────────
// Must be defined BEFORE /:id so Express doesn't treat "new" as an id
router.get("/new", isLoggedIn, listingCtrl.renderNewForm);

// ─── /listings/:id ────────────────────────────────────────────────────────────
router
  .route("/:id")
  .get(wrapAsync(listingCtrl.showListing))
  .put(
    isLoggedIn,
    wrapAsync(isOwner),
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingCtrl.updateListing),
  )
  .delete(
    isLoggedIn,
    wrapAsync(isOwner),
    wrapAsync(listingCtrl.destroyListing),
  );

// ─── /listings/:id/edit ───────────────────────────────────────────────────────
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(listingCtrl.renderEditForm),
);

module.exports = router;
