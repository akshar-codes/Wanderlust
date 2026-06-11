"use strict";

const listingRepo = require("../repositories/listing.repository.js");
const { cloudinary } = require("../config/cloudConfig.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const AppError = require("../utils/AppError.js");

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

// ── Helpers ────────────────────────────────────────────────────────────────────

async function geocodeLocation(locationString) {
  const geoResponse = await geocodingClient
    .forwardGeocode({ query: locationString, limit: 1 })
    .send();

  const features = geoResponse.body.features;
  if (!features?.length) {
    throw AppError.badRequest("Could not geocode the provided location");
  }

  return features[0].geometry;
}

/**
 * Destroy a Cloudinary asset safely (non-fatal on failure).
 */
async function safeCloudinaryDelete(filename) {
  if (!filename) return;
  try {
    await cloudinary.uploader.destroy(filename);
  } catch (err) {
    console.error("[ListingService] Cloudinary delete failed:", err.message);
  }
}

/**
 * Build a structured images array entry from a Multer file object.
 */
function fileToImageEntry(file, isPrimary = false) {
  return {
    url: file.path,
    filename: file.filename,
    caption: null,
    isPrimary,
  };
}

// ── Read ───────────────────────────────────────────────────────────────────────

const getAllListings = async (filters = {}, paginationOpts = {}) => {
  const { category, featured, propertyType, minPrice, maxPrice, minGuests } =
    filters;

  const query = {};
  if (category) query.category = category;
  if (featured !== undefined)
    query.featured = featured === "true" || featured === true;
  if (propertyType) query.propertyType = propertyType;
  if (minGuests) query.maxGuests = { $gte: Number(minGuests) };

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.$or = [
      ...(minPrice !== undefined
        ? [{ price: { $gte: Number(minPrice) } }]
        : []),
      ...(maxPrice !== undefined
        ? [{ price: { $lte: Number(maxPrice) } }]
        : []),
    ];
    // Prefer pricing.nightlyPrice when both could exist
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.$or = [
        { price: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
        {
          "pricing.nightlyPrice": {
            $gte: Number(minPrice),
            $lte: Number(maxPrice),
          },
        },
      ];
    }
  }

  return listingRepo.findPaginated(query, paginationOpts);
};

const getListingById = async (id) => {
  const listing = await listingRepo.findByIdWithDetails(id);
  if (!listing) throw AppError.notFound("Listing not found");
  return listing;
};

const getListingBySlug = async (slug) => {
  const listing = await listingRepo.findBySlug(slug);
  if (!listing) throw AppError.notFound("Listing not found");
  return listing;
};

const getListingForEdit = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  const originalImageUrl = listing.image?.url
    ? listing.image.url.replace("/upload", "/upload/w_250")
    : null;

  return { listing, originalImageUrl };
};

const getFeaturedListings = async (limit = 10) => {
  return listingRepo.findFeatured(limit);
};

// ── Write ──────────────────────────────────────────────────────────────────────

const createListing = async (listingData, file, ownerId) => {
  // Geocode location
  const geometry = await geocodeLocation(listingData.location);

  // Build pricing sub-document
  const price = Number(listingData.price) || 0;
  const pricing = {
    nightlyPrice:
      listingData.pricing?.nightlyPrice != null
        ? Number(listingData.pricing.nightlyPrice)
        : price,
    cleaningFee: Number(listingData.pricing?.cleaningFee ?? 0),
    serviceFee: Number(listingData.pricing?.serviceFee ?? 0),
    taxes: Number(listingData.pricing?.taxes ?? 0),
  };

  // Images — at least one required (the upload)
  if (!file) throw AppError.badRequest("At least one image is required");

  const primaryImageEntry = fileToImageEntry(file, true);

  // Extract capacity fields
  const capacity = {
    bedrooms: listingData.bedrooms != null ? Number(listingData.bedrooms) : 1,
    bathrooms:
      listingData.bathrooms != null ? Number(listingData.bathrooms) : 1,
    beds: listingData.beds != null ? Number(listingData.beds) : 1,
    maxGuests:
      listingData.maxGuests != null ? Number(listingData.maxGuests) : 2,
  };

  const newListing = {
    // Core text fields
    title: listingData.title,
    description: listingData.description,
    shortDescription: listingData.shortDescription ?? null,
    propertyType: listingData.propertyType ?? "other",
    category: listingData.category,
    location: listingData.location,
    country: listingData.country,

    // Pricing
    price: pricing.nightlyPrice,
    pricing,

    // Capacity
    ...capacity,

    // Amenities & rules
    amenities: Array.isArray(listingData.amenities)
      ? listingData.amenities
      : [],
    houseRules: listingData.houseRules ?? {},

    // Images
    images: [primaryImageEntry],
    image: { url: primaryImageEntry.url, filename: primaryImageEntry.filename },

    // Geo
    geometry,

    // Meta
    owner: ownerId,
    status: listingData.status ?? "active",
    draft: listingData.draft === true || listingData.draft === "true",
    featured: false,

    // Stay limits
    minimumStay:
      listingData.minimumStay != null ? Number(listingData.minimumStay) : 1,
    maximumStay:
      listingData.maximumStay != null ? Number(listingData.maximumStay) : null,
  };

  return listingRepo.create(newListing);
};

const updateListing = async (id, listingData, file) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  const updates = { ...listingData };

  // Re-geocode if location changed
  if (listingData.location && listingData.location !== listing.location) {
    updates.geometry = await geocodeLocation(listingData.location);
  }

  // Sync pricing ↔ legacy price
  if (updates.pricing?.nightlyPrice != null) {
    updates.price = Number(updates.pricing.nightlyPrice);
  } else if (updates.price != null) {
    updates["pricing.nightlyPrice"] = Number(updates.price);
  }

  // Handle new primary image upload
  if (file) {
    const oldFilename = listing.image?.filename;
    const newImageEntry = fileToImageEntry(file, true);

    // Clear isPrimary on existing images, then add new one
    updates.$push = { images: newImageEntry };
    updates.$set = {
      ...(updates.$set ?? {}),
      "images.$[].isPrimary": false,
      image: { url: newImageEntry.url, filename: newImageEntry.filename },
    };
    delete updates.$push; // handled below via repo

    const updated = await listingRepo.updateById(id, {
      ...updates,
      "images.$[].isPrimary": false,
    });

    await listingRepo.addImage(id, newImageEntry);
    await safeCloudinaryDelete(oldFilename);
    return listingRepo.findById(id);
  }

  return listingRepo.updateById(id, updates);
};

const partialUpdateListing = async (id, updates) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  if (!updates || Object.keys(updates).length === 0) {
    throw AppError.badRequest("No update fields provided");
  }

  // Sync pricing ↔ legacy price
  if (updates.pricing?.nightlyPrice != null) {
    updates.price = Number(updates.pricing.nightlyPrice);
  } else if (updates.price != null && !("pricing" in updates)) {
    updates["pricing.nightlyPrice"] = Number(updates.price);
  }

  return listingRepo.updateById(id, updates);
};

const deleteListing = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  // Collect all Cloudinary filenames to clean up
  const filenames = [
    ...(listing.images ?? []).map((img) => img.filename).filter(Boolean),
    listing.image?.filename,
  ].filter(Boolean);

  await listingRepo.deleteById(id);

  // Clean up all images from Cloudinary after deletion
  await Promise.allSettled(filenames.map(safeCloudinaryDelete));
};

// ── Status & visibility management ───────────────────────────────────────────

const publishListing = async (id, ownerId) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  return listingRepo.updateById(id, { draft: false, status: "active" });
};

const unpublishListing = async (id, ownerId) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  return listingRepo.updateById(id, { draft: true });
};

const setFeatured = async (id, featured) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  return listingRepo.updateById(id, { featured: Boolean(featured) });
};

// ── Multi-image management ────────────────────────────────────────────────────

const addImages = async (id, files, ownerId) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  if (!files?.length) throw AppError.badRequest("No images provided");

  const hasExistingPrimary = listing.images.some((img) => img.isPrimary);

  const imageEntries = files.map((file, i) =>
    fileToImageEntry(file, !hasExistingPrimary && i === 0),
  );

  let updated = listing;
  for (const entry of imageEntries) {
    updated = await listingRepo.addImage(id, entry);
  }

  return updated;
};

const removeListingImage = async (listingId, imageId, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  const imageDoc = listing.images.id(imageId);
  if (!imageDoc) throw AppError.notFound("Image not found");

  if (listing.images.length === 1) {
    throw AppError.badRequest("A listing must have at least one image");
  }

  const updated = await listingRepo.removeImage(listingId, imageId);
  await safeCloudinaryDelete(imageDoc.filename);
  return updated;
};

const setPrimaryImage = async (listingId, imageId, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  return listingRepo.setPrimaryImage(listingId, imageId);
};

// ── Availability ──────────────────────────────────────────────────────────────

const addBlockedDate = async (listingId, blockedDate, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  if (new Date(blockedDate.startDate) >= new Date(blockedDate.endDate)) {
    throw AppError.badRequest("startDate must be before endDate");
  }

  return listingRepo.addBlockedDate(listingId, blockedDate);
};

const removeBlockedDate = async (listingId, blockedDateId, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  return listingRepo.removeBlockedDate(listingId, blockedDateId);
};

// ── Rating recalculation (called by review service) ──────────────────────────

const recalculateListingRating = async (listingId) => {
  return listingRepo.recalculateRating(listingId);
};

// ── Wishlist helpers ──────────────────────────────────────────────────────────

const incrementWishlistCount = async (listingId, amount = 1) => {
  return listingRepo.incrementCounter(listingId, "wishlistCount", amount);
};

module.exports = {
  // Read
  getAllListings,
  getListingById,
  getListingBySlug,
  getListingForEdit,
  getFeaturedListings,
  // Write
  createListing,
  updateListing,
  partialUpdateListing,
  deleteListing,
  // Visibility
  publishListing,
  unpublishListing,
  setFeatured,
  // Images
  addImages,
  removeListingImage,
  setPrimaryImage,
  // Availability
  addBlockedDate,
  removeBlockedDate,
  // Stats
  recalculateListingRating,
  incrementWishlistCount,
};
