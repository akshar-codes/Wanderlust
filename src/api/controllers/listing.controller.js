const listingService = require("../../services/listing.service");
const AppError = require("../../utils/AppError");
const { sendSuccess } = require("../../utils/apiResponse");

// ── GET /api/listings ─────────────────────────────────────────────────────────
const index = async (req, res) => {
  const { category, page = 1, limit = 20, sort = "createdAt" } = req.query;

  const allListings = await listingService.getAllListings(category);

  // Lightweight pagination applied after fetch (upgrade to DB-level later)
  const start = (Number(page) - 1) * Number(limit);
  const paginated = allListings.slice(start, start + Number(limit));

  return sendSuccess(res, {
    listings: paginated,
    pagination: {
      total: allListings.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(allListings.length / Number(limit)),
    },
  });
};

// ── GET /api/listings/:id ─────────────────────────────────────────────────────
const show = async (req, res, next) => {
  const listing = await listingService.getListingById(req.params.id);
  if (!listing) return next(AppError.notFound("Listing not found"));
  return sendSuccess(res, { listing });
};

// ── POST /api/listings ────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  if (!req.file) return next(AppError.badRequest("Image upload is required"));

  const listing = await listingService.createListing(
    req.body.listing,
    req.file,
    req.user._id,
  );

  return sendSuccess(res, { listing }, 201);
};

// ── PUT /api/listings/:id  (full replace) ─────────────────────────────────────
const update = async (req, res) => {
  const listing = await listingService.updateListing(
    req.params.id,
    req.body.listing,
    req.file,
  );
  return sendSuccess(res, { listing });
};

// ── PATCH /api/listings/:id  (partial update) ────────────────────────────────
const partialUpdate = async (req, res, next) => {
  const updates = req.body.listing ?? req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return next(AppError.badRequest("No update fields provided"));
  }

  const listing = await listingService.updateListing(
    req.params.id,
    updates,
    req.file,
  );
  return sendSuccess(res, { listing });
};

// ── DELETE /api/listings/:id ──────────────────────────────────────────────────
const destroy = async (req, res) => {
  await listingService.deleteListing(req.params.id);
  return sendSuccess(res, { message: "Listing deleted successfully" });
};

module.exports = { index, show, create, update, partialUpdate, destroy };
