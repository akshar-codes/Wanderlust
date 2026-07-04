import * as wishlistService from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── GET /api/wishlist ──────────────────────────────────────────────────────────

export const index = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const result = await wishlistService.getWishlist(req.user._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
  });

  return sendSuccess(res, {
    items: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── POST /api/wishlist/:listingId ─────────────────────────────────────────────

export const toggle = async (req, res) => {
  const result = await wishlistService.toggleWishlist(
    req.user._id,
    req.params.listingId,
  );
  return sendSuccess(res, result);
};

// ── DELETE /api/wishlist/:listingId ───────────────────────────────────────────

export const destroy = async (req, res) => {
  await wishlistService.removeFromWishlist(req.user._id, req.params.listingId);
  return sendSuccess(res, { message: "Removed from wishlist" });
};
