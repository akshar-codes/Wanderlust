import * as itemRepo from "../repositories/wishlist.repository.js";
import * as collectionRepo from "../repositories/wishlistCollection.repository.js";
import * as collectionService from "./wishlistCollection.service.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveCollection = async (userId, collectionId) => {
  if (!collectionId) {
    return collectionService.ensureDefaultCollection(userId);
  }

  const collection = await collectionRepo.findById(collectionId);
  if (!collection) throw AppError.notFound("Wishlist not found");
  if (String(collection.owner) !== String(userId)) {
    throw AppError.forbidden("You do not own this wishlist");
  }
  return collection;
};

// ── Toggle (add if absent, remove if present) ─────────────────────────────────

export const toggleWishlist = async (userId, listingId, collectionId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  const collection = await resolveCollection(userId, collectionId);
  const existing = await itemRepo.findInCollection(collection._id, listingId);

  if (existing) {
    await itemRepo.deleteOne(collection._id, listingId);
    await listingRepo.incrementCounter(listingId, "wishlistCount", -1);
    await collectionRepo.incrementItemCount(collection._id, -1);
    return { wishlisted: false, collectionId: collection._id };
  }

  try {
    await itemRepo.create({
      user: userId,
      listing: listingId,
      collection: collection._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return { wishlisted: true, collectionId: collection._id };
    }
    throw err;
  }

  await listingRepo.incrementCounter(listingId, "wishlistCount", 1);
  await collectionRepo.incrementItemCount(collection._id, 1);

  if (!collection.coverImage && listing.image?.url) {
    await collectionRepo.setCoverImage(collection._id, listing.image.url);
  }

  return { wishlisted: true, collectionId: collection._id };
};

// ── Explicit removal ───────────────────────────────────────────────────────────

export const removeFromWishlist = async (userId, listingId, collectionId) => {
  const collection = await resolveCollection(userId, collectionId);
  const existing = await itemRepo.findInCollection(collection._id, listingId);

  if (!existing) {
    throw AppError.notFound("This listing is not in the selected wishlist");
  }

  await itemRepo.deleteOne(collection._id, listingId);
  await listingRepo.incrementCounter(listingId, "wishlistCount", -1);
  await collectionRepo.incrementItemCount(collection._id, -1);
};

// ── Move between collections ──────────────────────────────────────────────────

export const moveItem = async (
  userId,
  listingId,
  fromCollectionId,
  toCollectionId,
) => {
  if (String(fromCollectionId) === String(toCollectionId)) {
    throw AppError.badRequest("Source and destination wishlist are the same");
  }

  const [fromCollection, toCollection] = await Promise.all([
    collectionRepo.findById(fromCollectionId),
    collectionRepo.findById(toCollectionId),
  ]);

  if (!fromCollection || String(fromCollection.owner) !== String(userId)) {
    throw AppError.forbidden("You do not own the source wishlist");
  }
  if (!toCollection || String(toCollection.owner) !== String(userId)) {
    throw AppError.forbidden("You do not own the destination wishlist");
  }

  const item = await itemRepo.findInCollection(fromCollectionId, listingId);
  if (!item) {
    throw AppError.notFound("This listing is not in the source wishlist");
  }

  const clash = await itemRepo.findInCollection(toCollectionId, listingId);
  if (clash) {
    await itemRepo.deleteOne(fromCollectionId, listingId);
    await collectionRepo.incrementItemCount(fromCollectionId, -1);
    return clash;
  }

  const moved = await itemRepo.moveItem(item._id, toCollectionId);
  await collectionRepo.incrementItemCount(fromCollectionId, -1);
  await collectionRepo.incrementItemCount(toCollectionId, 1);
  return moved;
};

// ── Status ─────────────────────────────────────────────────────────────────────

export const getWishlistStatus = async (userId, listingId) => {
  const items = await itemRepo.findAnyForUserListing(userId, listingId);
  return {
    wishlisted: items.length > 0,
    collectionIds: items.map((item) => String(item.collection)),
  };
};

// ── Read ───────────────────────────────────────────────────────────────────────

export const getCollectionItems = (collectionId, opts) =>
  itemRepo.findPaginatedByCollection(collectionId, opts);
