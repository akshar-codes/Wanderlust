import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
import * as listingRepo from "../repositories/listing.repository.js";
import { cloudinary } from "../config/cloudConfig.js";
import AppError from "../utils/AppError.js";

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

async function safeCloudinaryDelete(filename) {
  if (!filename) return;
  try {
    await cloudinary.uploader.destroy(filename);
  } catch (err) {
    console.error("[ListingService] Cloudinary delete failed:", err.message);
  }
}

function fileToImageEntry(file, isPrimary = false) {
  return {
    url: file.path,
    filename: file.filename,
    caption: null,
    isPrimary,
  };
}

// ── Read ───────────────────────────────────────────────────────────────────────

export const getAllListings = async (filters = {}, paginationOpts = {}) => {
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

export const getListingById = async (id) => {
  const listing = await listingRepo.findByIdWithDetails(id);
  if (!listing) throw AppError.notFound("Listing not found");
  return listing;
};

export const getListingBySlug = async (slug) => {
  const listing = await listingRepo.findBySlug(slug);
  if (!listing) throw AppError.notFound("Listing not found");
  return listing;
};

export const getListingForEdit = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  const originalImageUrl = listing.image?.url
    ? listing.image.url.replace("/upload", "/upload/w_250")
    : null;

  return { listing, originalImageUrl };
};

export const getFeaturedListings = async (limit = 10) =>
  listingRepo.findFeatured(limit);

// ── Write ──────────────────────────────────────────────────────────────────────

export const createListing = async (listingData, file, ownerId) => {
  const geometry = await geocodeLocation(listingData.location);

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

  if (!file) throw AppError.badRequest("At least one image is required");

  const primaryImageEntry = fileToImageEntry(file, true);

  const capacity = {
    bedrooms: listingData.bedrooms != null ? Number(listingData.bedrooms) : 1,
    bathrooms:
      listingData.bathrooms != null ? Number(listingData.bathrooms) : 1,
    beds: listingData.beds != null ? Number(listingData.beds) : 1,
    maxGuests:
      listingData.maxGuests != null ? Number(listingData.maxGuests) : 2,
  };

  const newListing = {
    title: listingData.title,
    description: listingData.description,
    shortDescription: listingData.shortDescription ?? null,
    propertyType: listingData.propertyType ?? "other",
    category: listingData.category,
    location: listingData.location,
    country: listingData.country,
    price: pricing.nightlyPrice,
    pricing,
    ...capacity,
    amenities: Array.isArray(listingData.amenities)
      ? listingData.amenities
      : [],
    houseRules: listingData.houseRules ?? {},
    images: [primaryImageEntry],
    image: { url: primaryImageEntry.url, filename: primaryImageEntry.filename },
    geometry,
    owner: ownerId,
    status: listingData.status ?? "active",
    draft: listingData.draft === true || listingData.draft === "true",
    featured: false,
    minimumStay:
      listingData.minimumStay != null ? Number(listingData.minimumStay) : 1,
    maximumStay:
      listingData.maximumStay != null ? Number(listingData.maximumStay) : null,
  };

  return listingRepo.create(newListing);
};

export const updateListing = async (id, listingData, file) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  const updates = { ...listingData };

  if (listingData.location && listingData.location !== listing.location) {
    updates.geometry = await geocodeLocation(listingData.location);
  }

  if (updates.pricing?.nightlyPrice != null) {
    updates.price = Number(updates.pricing.nightlyPrice);
  } else if (updates.price != null) {
    updates["pricing.nightlyPrice"] = Number(updates.price);
  }

  if (file) {
    const oldFilename = listing.image?.filename;
    const newImageEntry = fileToImageEntry(file, true);

    updates.$set = {
      ...(updates.$set ?? {}),
      "images.$[].isPrimary": false,
      image: { url: newImageEntry.url, filename: newImageEntry.filename },
    };

    await listingRepo.updateById(id, {
      ...updates,
      "images.$[].isPrimary": false,
    });

    await listingRepo.addImage(id, newImageEntry);
    await safeCloudinaryDelete(oldFilename);
    return listingRepo.findById(id);
  }

  return listingRepo.updateById(id, updates);
};

export const partialUpdateListing = async (id, updates) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  if (!updates || Object.keys(updates).length === 0) {
    throw AppError.badRequest("No update fields provided");
  }

  if (updates.pricing?.nightlyPrice != null) {
    updates.price = Number(updates.pricing.nightlyPrice);
  } else if (updates.price != null && !("pricing" in updates)) {
    updates["pricing.nightlyPrice"] = Number(updates.price);
  }

  return listingRepo.updateById(id, updates);
};

export const deleteListing = async (id) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");

  const filenames = [
    ...(listing.images ?? []).map((img) => img.filename).filter(Boolean),
    listing.image?.filename,
  ].filter(Boolean);

  await listingRepo.deleteById(id);

  await Promise.allSettled(filenames.map(safeCloudinaryDelete));
};

// ── Status & visibility ───────────────────────────────────────────────────────

export const publishListing = async (id, ownerId) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");
  return listingRepo.updateById(id, { draft: false, status: "active" });
};

export const unpublishListing = async (id, ownerId) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");
  return listingRepo.updateById(id, { draft: true });
};

export const setFeatured = async (id, featured) => {
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound("Listing not found");
  return listingRepo.updateById(id, { featured: Boolean(featured) });
};

// ── Multi-image management ────────────────────────────────────────────────────

export const addImages = async (id, files, ownerId) => {
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

export const removeListingImage = async (listingId, imageId, ownerId) => {
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

export const setPrimaryImage = async (listingId, imageId, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");
  return listingRepo.setPrimaryImage(listingId, imageId);
};

// ── Availability ──────────────────────────────────────────────────────────────

export const addBlockedDate = async (listingId, blockedDate, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");

  if (new Date(blockedDate.startDate) >= new Date(blockedDate.endDate)) {
    throw AppError.badRequest("startDate must be before endDate");
  }

  return listingRepo.addBlockedDate(listingId, blockedDate);
};

export const removeBlockedDate = async (listingId, blockedDateId, ownerId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (!listing.owner.equals(ownerId))
    throw AppError.forbidden("You do not own this listing");
  return listingRepo.removeBlockedDate(listingId, blockedDateId);
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const recalculateListingRating = async (listingId) =>
  listingRepo.recalculateRating(listingId);

export const incrementWishlistCount = async (listingId, amount = 1) =>
  listingRepo.incrementCounter(listingId, "wishlistCount", amount);
