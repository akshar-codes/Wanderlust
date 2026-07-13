import * as collectionRepo from "../repositories/wishlistCollection.repository.js";
import * as itemRepo from "../repositories/wishlist.repository.js";
import AppError from "../utils/AppError.js";

const MAX_COLLECTIONS_PER_USER = 30;

// ── Ownership guard ────────────────────────────────────────────────────────────

function assertOwnership(collection, userId) {
  if (!collection) throw AppError.notFound("Wishlist not found");
  if (String(collection.owner) !== String(userId)) {
    throw AppError.forbidden("You do not own this wishlist");
  }
}

// ── Default collection bootstrap ──────────────────────────────────────────────

export const ensureDefaultCollection = async (userId) => {
  let defaultCollection = await collectionRepo.findDefaultForOwner(userId);
  if (!defaultCollection) {
    defaultCollection = await collectionRepo.create({
      owner: userId,
      name: "My Wishlist",
      isDefault: true,
      visibility: "private",
    });
  }
  return defaultCollection;
};

// ── CRUD ───────────────────────────────────────────────────────────────────────

export const listCollections = async (userId) => {
  await ensureDefaultCollection(userId);
  return collectionRepo.findByOwner(userId);
};

export const createCollection = async (userId, { name, description }) => {
  const count = await collectionRepo.countByOwner(userId);
  if (count >= MAX_COLLECTIONS_PER_USER) {
    throw AppError.badRequest(
      `You can have at most ${MAX_COLLECTIONS_PER_USER} wishlists`,
    );
  }
  return collectionRepo.create({
    owner: userId,
    name,
    description: description ?? null,
  });
};

export const getCollection = async (collectionId, userId) => {
  const collection = await collectionRepo.findById(collectionId);
  assertOwnership(collection, userId);
  return collection;
};

export const updateCollection = async (collectionId, userId, updates) => {
  const collection = await collectionRepo.findById(collectionId);
  assertOwnership(collection, userId);

  const allowedFields = ["name", "description"];
  const sanitized = {};
  for (const field of allowedFields) {
    if (field in updates) sanitized[field] = updates[field];
  }

  if (Object.keys(sanitized).length === 0) {
    throw AppError.badRequest("No valid fields provided for update");
  }

  return collectionRepo.updateById(collectionId, sanitized);
};

export const deleteCollection = async (collectionId, userId) => {
  const collection = await collectionRepo.findById(collectionId);
  assertOwnership(collection, userId);

  if (collection.isDefault) {
    throw AppError.badRequest("Your default wishlist cannot be deleted");
  }

  await itemRepo.deleteAllForCollection(collectionId);
  await collectionRepo.deleteById(collectionId);
};

// ── Sharing ────────────────────────────────────────────────────────────────────

export const enableSharing = async (collectionId, userId) => {
  const collection = await collectionRepo.findById(collectionId);
  assertOwnership(collection, userId);
  return collectionRepo.enableSharing(collectionId);
};

export const disableSharing = async (collectionId, userId) => {
  const collection = await collectionRepo.findById(collectionId);
  assertOwnership(collection, userId);
  return collectionRepo.disableSharing(collectionId);
};

/** Public lookup — no ownership check, only returns collections that are
 * currently marked `shared` with a matching, still-valid token. */
export const getSharedCollection = async (token) => {
  const collection = await collectionRepo.findByShareToken(token);
  if (!collection) {
    throw AppError.notFound(
      "This shared wishlist link is invalid or has expired",
    );
  }
  return collection;
};
