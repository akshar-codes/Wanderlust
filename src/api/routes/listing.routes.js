const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const listingCtrl = require("../controllers/listing.controller");
const isLoggedIn = require("../middlewares/isLoggedIn.api");
const isOwner = require("../middlewares/isOwner.api");
const upload = require("../../middlewares/upload");
const validate = require("../../middlewares/validate");
const { listingBodySchema } = require("../../validators/schemas");
const { createLimiter } = require("../../config/rateLimiter.config");

/**
 * GET  /api/listings          → list all (filter: ?category=mountains)
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

/**
 * GET    /api/listings/:id    → show a single listing
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
    asyncHandler(listingCtrl.partialUpdate),
  )
  .delete(isLoggedIn, isOwner, asyncHandler(listingCtrl.destroy));

module.exports = router;
