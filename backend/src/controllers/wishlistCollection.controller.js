import * as collectionService from "../services/wishlistCollection.service.js";
import * as itemService from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── GET /api/wishlists ─────────────────────────────────────────────────────────

export const index = async (req, res) => {
  const collections = await collectionService.listCollections(req.user._id);
  return sendSuccess(res, { collections });
};

// ── POST /api/wishlists ────────────────────────────────────────────────────────

export const create = async (req, res) => {
  const collection = await collectionService.createCollection(
    req.user._id,
    req.body,
  );
  return sendSuccess(res, { collection }, 201);
};

// ── GET /api/wishlists/:id ─────────────────────────────────────────────────────

export const show = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const collection = await collectionService.getCollection(
    req.params.id,
    req.user._id,
  );
  const result = await itemService.getCollectionItems(collection._id, {
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

// ── PATCH /api/wishlists/:id ───────────────────────────────────────────────────

export const update = async (req, res) => {
  const collection = await collectionService.updateCollection(
    req.params.id,
    req.user._id,
    req.body,
  );
  return sendSuccess(res, { collection, message: "Wishlist updated" });
};

// ── DELETE /api/wishlists/:id ──────────────────────────────────────────────────

export const destroy = async (req, res) => {
  await collectionService.deleteCollection(req.params.id, req.user._id);
  return sendSuccess(res, { message: "Wishlist deleted" });
};

// ── POST /api/wishlists/:id/share ──────────────────────────────────────────────

export const share = async (req, res) => {
  const collection = await collectionService.enableSharing(
    req.params.id,
    req.user._id,
  );
  const frontendBase = process.env.FRONTEND_URL ?? "http://localhost:5173";

  return sendSuccess(res, {
    collection,
    shareUrl: `${frontendBase}/wishlist/shared/${collection.shareToken}`,
  });
};

// ── DELETE /api/wishlists/:id/share ────────────────────────────────────────────

export const unshare = async (req, res) => {
  const collection = await collectionService.disableSharing(
    req.params.id,
    req.user._id,
  );
  return sendSuccess(res, { collection, message: "Sharing disabled" });
};

// ── GET /api/wishlists/shared/:token (public, no auth) ─────────────────────────

export const showShared = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const collection = await collectionService.getSharedCollection(
    req.params.token,
  );
  const result = await itemService.getCollectionItems(collection._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
  });

  return sendSuccess(res, {
    collection: {
      id: collection._id,
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      itemCount: collection.itemCount,
    },
    items: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};
