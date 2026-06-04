const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const listingRepo = require("../repositories/listing.repository");

module.exports = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const listing = await listingRepo.findById(id);
  if (!listing) return next(AppError.notFound("Listing not found"));

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this listing");

    // Browser clients get a redirect; API clients get a 403
    if (req.accepts("html")) return res.redirect(`/listings/${id}`);
    return next(
      AppError.forbidden("You don't have permission to edit this listing"),
    );
  }

  next();
});
