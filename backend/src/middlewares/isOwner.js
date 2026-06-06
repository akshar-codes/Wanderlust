const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const listingRepo = require("../repositories/listing.repository");

module.exports = asyncHandler(async (req, _res, next) => {
  const listing = await listingRepo.findById(req.params.id);
  if (!listing) return next(AppError.notFound("Listing not found"));

  if (!listing.owner.equals(req.user._id)) {
    return next(AppError.forbidden("You do not own this listing"));
  }

  next();
});
