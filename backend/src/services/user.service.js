import * as userRepo from "../repositories/user.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import * as reviewService from "./review.service.js";
import AppError from "../utils/AppError.js";
import { cloudinary } from "../config/cloudConfig.js";
import User from "../models/user.js";

// ── Registration ──────────────────────────────────────────────────────────────

export const registerUser = async (username, email, password, extras = {}) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw AppError.badRequest("An account with that email already exists");
  }

  const userDoc = new User({
    username,
    email: email.toLowerCase().trim(),
    firstName: extras.firstName ?? null,
    lastName: extras.lastName ?? null,
    provider: "local",
  });

  return userRepo.register(userDoc, password);
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const getUserProfile = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !user.isActive) throw AppError.notFound("User not found");
  return user;
};

export const getHostStats = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !user.isActive) throw AppError.notFound("User not found");

  const [listings, reviewSummary] = await Promise.all([
    listingRepo.findByOwner(user._id),
    reviewService.getHostReviewSummary(user._id),
  ]);

  const publishedListings = listings.filter(
    (l) => !l.draft && l.status === "active",
  );

  const totalWishlisted = listings.reduce(
    (sum, l) => sum + (l.wishlistCount ?? 0),
    0,
  );
  const totalBookings = listings.reduce(
    (sum, l) => sum + (l.bookingCount ?? 0),
    0,
  );

  return {
    totalListings: publishedListings.length,
    totalReviews: reviewSummary.totalReviews,
    averageRating: reviewSummary.averageRating,
    totalWishlisted,
    totalBookings,
    memberSince: user.createdAt,
  };
};

export const updateProfile = async (userId, updates) => {
  const allowedFields = ["firstName", "lastName", "bio", "phoneNumber"];
  const sanitized = {};
  for (const key of allowedFields) {
    if (key in updates) sanitized[key] = updates[key];
  }

  if (Object.keys(sanitized).length === 0) {
    throw AppError.badRequest("No valid fields provided for update");
  }

  const updated = await userRepo.updateById(userId, sanitized);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

export const updateAvatar = async (userId, file) => {
  if (!file) throw AppError.badRequest("Avatar image is required");

  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const oldPublicId = user.avatar?.publicId;

  const avatarData = {
    url: file.path,
    filename: file.filename,
    publicId: file.filename,
  };

  const updated = await userRepo.updateAvatar(userId, avatarData);

  if (oldPublicId) {
    cloudinary.uploader.destroy(oldPublicId).catch((err) => {
      console.error("[UserService] Cloudinary avatar delete failed:", err);
    });
  }

  return updated;
};

export const removeAvatar = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const oldPublicId = user.avatar?.publicId;

  const updated = await userRepo.updateAvatar(userId, {
    url: null,
    filename: null,
    publicId: null,
  });

  if (oldPublicId) {
    cloudinary.uploader.destroy(oldPublicId).catch((err) => {
      console.error("[UserService] Cloudinary avatar delete failed:", err);
    });
  }

  return updated;
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const updateSettings = async (userId, settings) => {
  const updated = await userRepo.updateSettings(userId, settings);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Notification preferences ──────────────────────────────────────────────────

export const updateNotificationPreferences = async (userId, prefs) => {
  const updated = await userRepo.updateNotificationPreferences(userId, prefs);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Role management ───────────────────────────────────────────────────────────

export const changeRole = async (targetUserId, newRole) => {
  const updated = await userRepo.updateRole(targetUserId, newRole);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Account lifecycle ─────────────────────────────────────────────────────────

export const deactivateUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");
  await userRepo.softDelete(userId);
};

export const deleteUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  if (user.avatar?.publicId) {
    cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }

  await userRepo.hardDelete(userId);
};

// ── Listings by user ──────────────────────────────────────────────────────────

export const getUserListings = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !user.isActive) throw AppError.notFound("User not found");
  return userRepo.findListingsByOwner(user._id);
};
