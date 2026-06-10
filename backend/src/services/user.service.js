"use strict";

const userRepo = require("../repositories/user.repository.js");
const AppError = require("../utils/AppError.js");
const { cloudinary } = require("../config/cloudConfig.js");
const User = require("../models/user.js");

// ── Registration ──────────────────────────────────────────────────────────────

const registerUser = async (username, email, password, extras = {}) => {
  // Check for duplicate email before passport-local-mongoose does it on username
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

  const registeredUser = await userRepo.register(userDoc, password);
  return registeredUser;
};

// ── Profile ───────────────────────────────────────────────────────────────────

const getUserProfile = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !user.isActive) throw AppError.notFound("User not found");
  return user;
};

const updateProfile = async (userId, updates) => {
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

const updateAvatar = async (userId, file) => {
  if (!file) throw AppError.badRequest("Avatar image is required");

  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const oldPublicId = user.avatar?.publicId;

  const avatarData = {
    url: file.path,
    filename: file.filename,
    publicId: file.filename, // Cloudinary storage sets filename as the public_id
  };

  const updated = await userRepo.updateAvatar(userId, avatarData);

  // Clean up old avatar from Cloudinary (fire-and-forget)
  if (oldPublicId) {
    cloudinary.uploader.destroy(oldPublicId).catch((err) => {
      console.error("[UserService] Cloudinary avatar delete failed:", err);
    });
  }

  return updated;
};

/**
 * Remove the user's avatar and fall back to initials.
 */
const removeAvatar = async (userId) => {
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

const updateSettings = async (userId, settings) => {
  const updated = await userRepo.updateSettings(userId, settings);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Notification preferences ──────────────────────────────────────────────────

const updateNotificationPreferences = async (userId, prefs) => {
  const updated = await userRepo.updateNotificationPreferences(userId, prefs);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Role management (admin only) ──────────────────────────────────────────────

const changeRole = async (targetUserId, newRole) => {
  const updated = await userRepo.updateRole(targetUserId, newRole);
  if (!updated) throw AppError.notFound("User not found");
  return updated;
};

// ── Account lifecycle ─────────────────────────────────────────────────────────

const deactivateUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  await userRepo.softDelete(userId);
};

const deleteUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  // Clean up avatar from Cloudinary
  if (user.avatar?.publicId) {
    cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }

  await userRepo.hardDelete(userId);
};

// ── Listings by user ──────────────────────────────────────────────────────────

const getUserListings = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !user.isActive) throw AppError.notFound("User not found");

  return userRepo.findListingsByOwner(user._id);
};

module.exports = {
  registerUser,
  getUserProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  updateSettings,
  updateNotificationPreferences,
  changeRole,
  deactivateUser,
  deleteUser,
  getUserListings,
};
