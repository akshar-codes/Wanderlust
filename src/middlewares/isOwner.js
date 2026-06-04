const listingRepo = require("../repositories/listing.repository.js");

module.exports = async (req, res, next) => {
  const { id } = req.params;

  const listing = await listingRepo.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
