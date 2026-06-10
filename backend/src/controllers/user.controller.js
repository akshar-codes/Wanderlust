"use strict";

const userService = require("../services/user.service.js");
const userRepo = require("../repositories/user.repository.js");
const AppError = require("../utils/AppError.js");
const { sendSuccess } = require("../utils/apiResponse.js");

// ── Serialization helpers ─────────────────────────────────────────────────────

/** Full profile for the authenticated user themselves (includes settings etc.) */
function serializeFullProfile(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatar: user.avatar?.url ?? null,
    bio: user.bio,
    phoneNumber: user.phoneNumber,
    role: user.role,
    emailVerified: user.emailVerified,
    profileCompletion: user.profileCompletion,
    provider: user.provider,
    isHost: user.isHost,
    totalListings: user.totalListings,
    totalReviews: user.totalReviews,
    notificationPreferences: user.notificationPreferences,
    settings: user.settings,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/** Trimmed public shape — visible to anyone viewing a user's profile */
function serializePublicProfile(user) {
  return {
    id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatar: user.avatar?.url ?? null,
    bio: user.bio,
    role: user.role,
    emailVerified: user.emailVerified,
    profileCompletion: user.profileCompletion,
    isHost: user.isHost,
    totalListings: user.totalListings,
    totalReviews: user.totalReviews,
    createdAt: user.createdAt,
  };
}

// ── GET /api/users/:username ──────────────────────────────────────────────────

const profile = async (req, res, next) => {
  const user = await userService.getUserProfile(req.params.username);

  // Authenticated users requesting their own profile get the full shape
  const isSelf =
    req.isAuthenticated() && req.user.username === req.params.username;

  return sendSuccess(res, {
    user: isSelf ? serializeFullProfile(user) : serializePublicProfile(user),
  });
};

// ── PATCH /api/users/:username/profile ────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, { user: serializeFullProfile(user) });
};

// ── PUT /api/users/:username/avatar ──────────────────────────────────────────

const updateAvatar = async (req, res, next) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  return sendSuccess(res, {
    user: serializeFullProfile(user),
    message: "Avatar updated successfully",
  });
};

// ── DELETE /api/users/:username/avatar ───────────────────────────────────────

const removeAvatar = async (req, res, next) => {
  const user = await userService.removeAvatar(req.user._id);
  return sendSuccess(res, {
    user: serializeFullProfile(user),
    message: "Avatar removed",
  });
};

// ── PATCH /api/users/:username/settings ──────────────────────────────────────

const updateSettings = async (req, res, next) => {
  const user = await userService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, {
    settings: user.settings,
    message: "Settings updated",
  });
};

// ── PATCH /api/users/:username/notifications ──────────────────────────────────

const updateNotificationPreferences = async (req, res, next) => {
  const user = await userService.updateNotificationPreferences(
    req.user._id,
    req.body,
  );
  return sendSuccess(res, {
    notificationPreferences: user.notificationPreferences,
    message: "Notification preferences updated",
  });
};

// ── PATCH /api/users/:username/role  (admin only) ─────────────────────────────

const changeRole = async (req, res, next) => {
  // Guard: only admins can change roles
  if (req.user.role !== "admin") {
    return next(AppError.forbidden("Only admins can change user roles"));
  }

  const target = await userRepo.findByUsername(req.params.username);
  if (!target) return next(AppError.notFound("User not found"));

  const updated = await userService.changeRole(target._id, req.body.role);
  return sendSuccess(res, {
    user: serializePublicProfile(updated),
    message: `Role changed to ${req.body.role}`,
  });
};

// ── GET /api/users/:username/listings ─────────────────────────────────────────

const listings = async (req, res, next) => {
  const userListings = await userService.getUserListings(req.params.username);
  return sendSuccess(res, { listings: userListings });
};

// ── DELETE /api/users/:username  (account deletion) ──────────────────────────

const destroy = async (req, res, next) => {
  const { username } = req.params;

  // Only the account owner or an admin may delete it
  if (req.user.username !== username && req.user.role !== "admin") {
    return next(AppError.forbidden("You can only delete your own account"));
  }

  await userService.deleteUser(req.user._id);

  await new Promise((resolve, reject) => {
    req.logout((err) => (err ? reject(err) : resolve()));
  });

  return sendSuccess(res, { message: "Account deleted successfully" });
};

module.exports = {
  profile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  updateSettings,
  updateNotificationPreferences,
  changeRole,
  listings,
  destroy,
};
