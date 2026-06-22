import * as listingService from "../services/listing.service.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const index = async (req, res) => {
  const {
    category,
    featured,
    propertyType,
    minPrice,
    maxPrice,
    minGuests,
    page = 1,
    limit = 20,
    sort = "createdAt",
  } = req.query;

  const sortMap = {
    createdAt: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { averageRating: -1 },
    popular: { bookingCount: -1 },
  };

  const { docs: listings, total } = await listingService.getAllListings(
    { category, featured, propertyType, minPrice, maxPrice, minGuests },
    {
      page: Number(page),
      limit: Number(limit),
      sort: sortMap[sort] ?? { createdAt: -1 },
    },
  );

  return sendSuccess(res, {
    listings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

export const featured = async (req, res) => {
  const { limit = 10 } = req.query;
  const listings = await listingService.getFeaturedListings(Number(limit));
  return sendSuccess(res, { listings });
};

export const showBySlug = async (req, res, next) => {
  const listing = await listingService.getListingBySlug(req.params.slug);
  if (!listing) return next(AppError.notFound("Listing not found"));
  return sendSuccess(res, { listing });
};

export const show = async (req, res, next) => {
  const listing = await listingService.getListingById(req.params.id);
  if (!listing) return next(AppError.notFound("Listing not found"));
  return sendSuccess(res, { listing });
};

export const create = async (req, res, next) => {
  if (!req.file)
    return next(AppError.badRequest("At least one image is required"));

  const listing = await listingService.createListing(
    req.body.listing,
    req.file,
    req.user._id,
  );

  return sendSuccess(res, { listing }, 201);
};

export const update = async (req, res) => {
  const listing = await listingService.updateListing(
    req.params.id,
    req.body.listing,
    req.file,
  );
  return sendSuccess(res, { listing });
};

export const partialUpdate = async (req, res, next) => {
  const updates = req.body.listing ?? req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return next(AppError.badRequest("No update fields provided"));
  }

  const listing = await listingService.partialUpdateListing(
    req.params.id,
    updates,
  );
  return sendSuccess(res, { listing });
};

export const destroy = async (req, res) => {
  await listingService.deleteListing(req.params.id);
  return sendSuccess(res, { message: "Listing deleted successfully" });
};

export const publish = async (req, res) => {
  const listing = await listingService.publishListing(
    req.params.id,
    req.user._id,
  );
  return sendSuccess(res, { listing, message: "Listing published" });
};

export const unpublish = async (req, res) => {
  const listing = await listingService.unpublishListing(
    req.params.id,
    req.user._id,
  );
  return sendSuccess(res, { listing, message: "Listing moved to drafts" });
};

export const setFeatured = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(AppError.forbidden("Only admins can feature listings"));
  }
  const { featured: featuredValue } = req.body;
  const listing = await listingService.setFeatured(
    req.params.id,
    featuredValue,
  );
  return sendSuccess(res, {
    listing,
    message: `Listing ${featuredValue ? "featured" : "unfeatured"}`,
  });
};

export const addImages = async (req, res, next) => {
  if (!req.files?.length) {
    return next(AppError.badRequest("No images provided"));
  }
  const listing = await listingService.addImages(
    req.params.id,
    req.files,
    req.user._id,
  );
  return sendSuccess(
    res,
    { listing, message: "Images added successfully" },
    201,
  );
};

export const removeImage = async (req, res) => {
  const listing = await listingService.removeListingImage(
    req.params.id,
    req.params.imageId,
    req.user._id,
  );
  return sendSuccess(res, { listing, message: "Image removed successfully" });
};

export const setPrimaryImage = async (req, res) => {
  const listing = await listingService.setPrimaryImage(
    req.params.id,
    req.params.imageId,
    req.user._id,
  );
  return sendSuccess(res, { listing, message: "Primary image updated" });
};

export const addBlockedDate = async (req, res) => {
  const listing = await listingService.addBlockedDate(
    req.params.id,
    req.body,
    req.user._id,
  );
  return sendSuccess(
    res,
    { listing, message: "Dates blocked successfully" },
    201,
  );
};

export const removeBlockedDate = async (req, res) => {
  const listing = await listingService.removeBlockedDate(
    req.params.id,
    req.params.blockedDateId,
    req.user._id,
  );
  return sendSuccess(res, { listing, message: "Blocked date removed" });
};
