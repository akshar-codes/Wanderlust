import crypto from "crypto";
import WishlistCollection from "../models/wishlistCollection.js";

// ── Write ──────────────────────────────────────────────────────────────────────

export const create = (data) => WishlistCollection.create(data);

export const updateById = (id, updates) =>
  WishlistCollection.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );

export const deleteById = (id) => WishlistCollection.findByIdAndDelete(id);

export const incrementItemCount = (id, amount = 1) =>
  WishlistCollection.findByIdAndUpdate(
    id,
    { $inc: { itemCount: amount } },
    { new: true },
  );

export const setCoverImage = (id, url) =>
  WishlistCollection.findByIdAndUpdate(id, { $set: { coverImage: url } });

// ── Read ───────────────────────────────────────────────────────────────────────

export const findById = (id) => WishlistCollection.findById(id);

export const findByOwner = (ownerId) =>
  WishlistCollection.find({ owner: ownerId }).sort({
    isDefault: -1,
    createdAt: -1,
  });

export const findDefaultForOwner = (ownerId) =>
  WishlistCollection.findOne({ owner: ownerId, isDefault: true });

export const countByOwner = (ownerId) =>
  WishlistCollection.countDocuments({ owner: ownerId });

export const findByShareToken = (token) =>
  WishlistCollection.findOne({ shareToken: token, visibility: "shared" });

// ── Sharing ────────────────────────────────────────────────────────────────────

export const generateShareToken = () => crypto.randomBytes(16).toString("hex");

export const enableSharing = (id) =>
  WishlistCollection.findByIdAndUpdate(
    id,
    { $set: { visibility: "shared", shareToken: generateShareToken() } },
    { new: true },
  );

export const disableSharing = (id) =>
  WishlistCollection.findByIdAndUpdate(
    id,
    { $set: { visibility: "private", shareToken: null } },
    { new: true },
  );
