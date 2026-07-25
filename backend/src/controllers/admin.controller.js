import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

// ── Platform Statistics ────────────────────────────────────────────────────────

export const getStats = async (req, res) => {
  const stats = await adminService.getPlatformStats();
  return sendSuccess(res, stats);
};

// ── Analytics ──────────────────────────────────────────────────────────────────

export const getAnalytics = async (req, res) => {
  const data = await adminService.getAnalyticsOverview(req.query);
  return sendSuccess(res, data);
};

// ── User Management ───────────────────────────────────────────────────────────

export const listUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;

  const result = await adminService.listUsers({
    page: Number(page),
    limit: Math.min(Number(limit), 100),
    search,
    role,
    status,
  });

  return sendSuccess(res, {
    users: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

export const updateUserStatus = async (req, res, next) => {
  const { username } = req.params;
  const { isActive, reason } = req.body;

  if (req.user.username === username) {
    return next(
      AppError.badRequest("You cannot change your own account status"),
    );
  }

  const user = await adminService.setUserActiveStatus(
    username,
    isActive,
    req.user._id,
  );

  return sendSuccess(res, {
    message: isActive ? "User reactivated" : "User suspended",
    user: { id: user._id, username: user.username, isActive: user.isActive },
  });
};

// ── Listing Moderation ─────────────────────────────────────────────────────────

export const listListings = async (req, res) => {
  const { page = 1, limit = 20, search, status, category, featured } = req.query;

  const result = await adminService.listListings({
    page: Number(page),
    limit: Math.min(Number(limit), 100),
    search,
    status,
    category,
    featured,
  });

  return sendSuccess(res, {
    listings: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

export const updateListingStatus = async (req, res) => {
  const { status, reason } = req.body;

  const listing = await adminService.setListingStatus(
    req.params.id,
    status,
    req.user._id,
    reason,
  );

  return sendSuccess(res, {
    listing,
    message: `Listing status updated to "${status}"`,
  });
};

// ── Review Moderation ──────────────────────────────────────────────────────────

export const listReviews = async (req, res) => {
  const { page = 1, limit = 20, rating, search } = req.query;

  const result = await adminService.listReviews({
    page: Number(page),
    limit: Math.min(Number(limit), 100),
    rating,
    search,
  });

  return sendSuccess(res, {
    reviews: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};
