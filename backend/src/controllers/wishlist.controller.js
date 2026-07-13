import * as wishlistService from "../services/wishlist.service.js";
import * as collectionService from "../services/wishlistCollection.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── GET /api/wishlist ──────────────────────────────────────────────────────────

export const index = async (req, res) => {
  const { page = 1, limit = 12, collectionId } = req.query;

  const collection = collectionId
    ? await collectionService.getCollection(collectionId, req.user._id)
    : await collectionService.ensureDefaultCollection(req.user._id);

  const result = await wishlistService.getCollectionItems(collection._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
  });

  return sendSuccess(res, {
    collection,
    items: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── GET /api/wishlist/status/:listingId ────────────────────────────────────────

export const status = async (req, res) => {
  const result = await wishlistService.getWishlistStatus(
    req.user._id,
    req.params.listingId,
  );
  return sendSuccess(res, result);
};

// ── POST /api/wishlist/:listingId ──────────────────────────────────────────────

export const toggle = async (req, res) => {
  const { collectionId } = req.body ?? {};
  const result = await wishlistService.toggleWishlist(
    req.user._id,
    req.params.listingId,
    collectionId,
  );
  return sendSuccess(res, result);
};

// ── DELETE /api/wishlist/:listingId ────────────────────────────────────────────

export const destroy = async (req, res) => {
  const { collectionId } = req.query;
  await wishlistService.removeFromWishlist(
    req.user._id,
    req.params.listingId,
    collectionId,
  );
  return sendSuccess(res, { message: "Removed from wishlist" });
};

// ── POST /api/wishlist/:listingId/move ─────────────────────────────────────────

export const move = async (req, res) => {
  const { fromCollectionId, toCollectionId } = req.body;
  const item = await wishlistService.moveItem(
    req.user._id,
    req.params.listingId,
    fromCollectionId,
    toCollectionId,
  );
  return sendSuccess(res, { item, message: "Listing moved" });
};
