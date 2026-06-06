const listingRepo = require("../repositories/listing.repository.js");
const { cloudinary } = require("../config/cloudConfig.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

// ─── Read ────────────────────────────────────────────────────────────────────

const getAllListings = async (category) => {
  const filter = category ? { category } : {};
  return listingRepo.findAll(filter);
};

const getListingById = async (id) => {
  const listing = await listingRepo.findByIdWithDetails(id);
  if (!listing) {
    const err = new Error("Listing not found");
    err.statusCode = 404;
    throw err;
  }
  return listing;
};

const getListingForEdit = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) {
    const err = new Error("Listing not found");
    err.statusCode = 404;
    throw err;
  }

  // Derive a thumbnail URL for the edit form preview (250 px wide)
  const originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250",
  );
  return { listing, originalImageUrl };
};

// ─── Write ───────────────────────────────────────────────────────────────────

const createListing = async (listingData, file, ownerId) => {
  // 1. Forward-geocode the location string
  const geoResponse = await geocodingClient
    .forwardGeocode({ query: listingData.location, limit: 1 })
    .send();

  const features = geoResponse.body.features;
  if (!features || features.length === 0) {
    const err = new Error("Could not geocode the provided location");
    err.statusCode = 400;
    throw err;
  }

  // 2. Build the document
  const newListing = {
    ...listingData,
    owner: ownerId,
    image: { url: file.path, filename: file.filename },
    geometry: features[0].geometry,
  };

  return listingRepo.create(newListing);
};

const updateListing = async (id, listingData, file) => {
  const listing = await listingRepo.findById(id);
  if (!listing) {
    const err = new Error("Listing not found");
    err.statusCode = 404;
    throw err;
  }

  const updates = { ...listingData };

  if (file) {
    // Remember the old filename before overwriting
    const oldFilename = listing.image?.filename;

    updates.image = { url: file.path, filename: file.filename };

    const updated = await listingRepo.updateById(id, updates);

    // Delete the superseded image from Cloudinary (non-fatal if it fails)
    if (oldFilename) {
      try {
        await cloudinary.uploader.destroy(oldFilename);
      } catch (cloudErr) {
        console.error("[ListingService] Cloudinary delete failed:", cloudErr);
      }
    }

    return updated;
  }

  return listingRepo.updateById(id, updates);
};

const deleteListing = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) {
    const err = new Error("Listing not found");
    err.statusCode = 404;
    throw err;
  }

  const filename = listing.image?.filename;

  // Mongoose post-hook on findByIdAndDelete cascades review deletion
  await listingRepo.deleteById(id);

  if (filename) {
    try {
      await cloudinary.uploader.destroy(filename);
    } catch (cloudErr) {
      console.error("[ListingService] Cloudinary delete failed:", cloudErr);
    }
  }
};

module.exports = {
  getAllListings,
  getListingById,
  getListingForEdit,
  createListing,
  updateListing,
  deleteListing,
};
