const listingService = require("../services/listing.service.js");

// ─── GET /listings ────────────────────────────────────────────────────────────

const index = async (req, res) => {
  const { category } = req.query;
  const allListings = await listingService.getAllListings(category);
  res.render("listings/index.ejs", { allListings, category });
};

// ─── GET /listings/new ────────────────────────────────────────────────────────

const renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ─── GET /listings/:id ────────────────────────────────────────────────────────

const showListing = async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// ─── POST /listings ───────────────────────────────────────────────────────────

const createListing = async (req, res) => {
  if (!req.file) {
    req.flash("error", "Image upload failed");
    return res.redirect("/listings/new");
  }

  await listingService.createListing(req.body.listing, req.file, req.user._id);

  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

// ─── GET /listings/:id/edit ───────────────────────────────────────────────────

const renderEditForm = async (req, res) => {
  const { listing, originalImageUrl } = await listingService.getListingForEdit(
    req.params.id,
  );
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ─── PUT /listings/:id ────────────────────────────────────────────────────────

const updateListing = async (req, res) => {
  await listingService.updateListing(req.params.id, req.body.listing, req.file);
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${req.params.id}`);
};

// ─── DELETE /listings/:id ─────────────────────────────────────────────────────

const destroyListing = async (req, res) => {
  await listingService.deleteListing(req.params.id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
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
