import * as userService from "../services/user.service.js";
import * as userRepo from "../repositories/user.repository.js";
import * as reviewService from "../services/review.service.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── Serialization helpers ─────────────────────────────────────────────────────

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

export const profile = async (req, res, next) => {
  const user = await userService.getUserProfile(req.params.username);
  const hostStats = await userService.getHostStats(req.params.username);

  const isSelf =
    req.isAuthenticated() && req.user.username === req.params.username;

  return sendSuccess(res, {
    user: isSelf ? serializeFullProfile(user) : serializePublicProfile(user),
    hostStats,
  });
};

// ── PATCH /api/users/:username/profile ────────────────────────────────────────

export const updateProfile = async (req, res, next) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, { user: serializeFullProfile(user) });
};

// ── PUT /api/users/:username/avatar ──────────────────────────────────────────

export const updateAvatar = async (req, res, next) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  return sendSuccess(res, {
    user: serializeFullProfile(user),
    message: "Avatar updated successfully",
  });
};

// ── DELETE /api/users/:username/avatar ───────────────────────────────────────

export const removeAvatar = async (req, res, next) => {
  const user = await userService.removeAvatar(req.user._id);
  return sendSuccess(res, {
    user: serializeFullProfile(user),
    message: "Avatar removed",
  });
};

// ── PATCH /api/users/:username/settings ──────────────────────────────────────

export const updateSettings = async (req, res, next) => {
  const user = await userService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, {
    settings: user.settings,
    message: "Settings updated",
  });
};

// ── PATCH /api/users/:username/notifications ──────────────────────────────────

export const updateNotificationPreferences = async (req, res, next) => {
  const user = await userService.updateNotificationPreferences(
    req.user._id,
    req.body,
  );
  return sendSuccess(res, {
    notificationPreferences: user.notificationPreferences,
    message: "Notification preferences updated",
  });
};

// ── PATCH /api/users/:username/role (admin only) ──────────────────────────────

export const changeRole = async (req, res, next) => {
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

export const listings = async (req, res, next) => {
  const userListings = await userService.getUserListings(req.params.username);
  return sendSuccess(res, { listings: userListings });
};

// ── GET /api/users/:username/reviews-received ─────────────────────────────────

export const reviewsReceived = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const user = await userRepo.findByUsername(req.params.username);
  if (!user || !user.isActive) {
    return next(AppError.notFound("User not found"));
  }

  const result = await reviewService.getReviewsReceivedByHost(user._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
  });

  return sendSuccess(res, {
    reviews: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1,
    },
  });
};

// ── DELETE /api/users/:username ───────────────────────────────────────────────

export const destroy = async (req, res, next) => {
  const { username } = req.params;

  if (req.user.username !== username && req.user.role !== "admin") {
    return next(AppError.forbidden("You can only delete your own account"));
  }

  await userService.deleteUser(req.user._id);

  await new Promise((resolve, reject) => {
    req.logout((err) => (err ? reject(err) : resolve()));
  });

  return sendSuccess(res, { message: "Account deleted successfully" });
};
