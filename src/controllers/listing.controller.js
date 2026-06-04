const listingService = require("../services/listing.service");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

// ── GET /listings ─────────────────────────────────────────────────────────────

const index = async (req, res) => {
  const { category } = req.query;
  const allListings = await listingService.getAllListings(category);

  // Browser → render view  |  API client → JSON
  if (req.accepts("html")) {
    return res.render("listings/index.ejs", { allListings, category });
  }
  return sendSuccess(res, { listings: allListings });
};

// ── GET /listings/new ─────────────────────────────────────────────────────────

const renderNewForm = (_req, res) => res.render("listings/new.ejs");

// ── GET /listings/:id ─────────────────────────────────────────────────────────

const showListing = async (req, res, next) => {
  const listing = await listingService.getListingById(req.params.id);
  if (!listing) return next(AppError.notFound("Listing does not exist"));

  if (req.accepts("html")) return res.render("listings/show.ejs", { listing });
  return sendSuccess(res, { listing });
};

// ── POST /listings ────────────────────────────────────────────────────────────

const createListing = async (req, res, next) => {
  if (!req.file) return next(AppError.badRequest("Image upload is required"));

  const listing = await listingService.createListing(
    req.body.listing,
    req.file,
    req.user._id,
  );

  req.flash("success", "New Listing Created");
  if (req.accepts("html")) return res.redirect("/listings");
  return sendSuccess(res, { listing }, 201);
};

// ── GET /listings/:id/edit ────────────────────────────────────────────────────

const renderEditForm = async (req, res, next) => {
  const result = await listingService.getListingForEdit(req.params.id);
  if (!result) return next(AppError.notFound("Listing does not exist"));

  return res.render("listings/edit.ejs", {
    listing: result.listing,
    originalImageUrl: result.originalImageUrl,
  });
};

// ── PUT /listings/:id ─────────────────────────────────────────────────────────

const updateListing = async (req, res) => {
  const listing = await listingService.updateListing(
    req.params.id,
    req.body.listing,
    req.file,
  );

  req.flash("success", "Listing Updated");
  if (req.accepts("html")) return res.redirect(`/listings/${req.params.id}`);
  return sendSuccess(res, { listing });
};

// ── DELETE /listings/:id ──────────────────────────────────────────────────────

const destroyListing = async (req, res) => {
  await listingService.deleteListing(req.params.id);

  req.flash("success", "Listing Deleted");
  if (req.accepts("html")) return res.redirect("/listings");
  return sendSuccess(res, { deleted: true });
};

module.exports = {
  index,
  renderNewForm,
  showListing,
  createListing,
  renderEditForm,
  updateListing,
  destroyListing,
};
