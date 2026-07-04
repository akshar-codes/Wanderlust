import * as wishlistRepo from "../repositories/wishlist.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";

// ── Toggle (add if absent, remove if present) ─────────────────────────────────

export const toggleWishlist = async (userId, listingId) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  const existing = await wishlistRepo.find(userId, listingId);

  if (existing) {
    await wishlistRepo.deleteOne(userId, listingId);
    await listingRepo.incrementCounter(listingId, "wishlistCount", -1);
    return { wishlisted: false };
  }

  try {
    await wishlistRepo.create(userId, listingId);
  } catch (err) {
    // Unique index race: two concurrent toggles both saw "not existing".
    // Treat as already-wishlisted rather than surfacing a 500.
    if (err.code === 11000) return { wishlisted: true };
    throw err;
  }

  await listingRepo.incrementCounter(listingId, "wishlistCount", 1);
  return { wishlisted: true };
};

// ── Explicit removal (used by the "Remove" button in the wishlist list) ──────

export const removeFromWishlist = async (userId, listingId) => {
  const existing = await wishlistRepo.find(userId, listingId);
  if (!existing) {
    throw AppError.notFound("This listing is not in your wishlist");
  }
  await wishlistRepo.deleteOne(userId, listingId);
  await listingRepo.incrementCounter(listingId, "wishlistCount", -1);
};

// ── Read ───────────────────────────────────────────────────────────────────────

export const getWishlist = (userId, opts) =>
  wishlistRepo.findPaginated(userId, opts);
