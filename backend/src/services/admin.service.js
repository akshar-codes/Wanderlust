import * as adminRepo from "../repositories/admin.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import * as reviewRepo from "../repositories/review.repository.js";
import AppError from "../utils/AppError.js";
import { resolveDateRange } from "../utils/dateUtils.js";
import logger from "../utils/logger.js";

// ── Platform statistics ─────────────────────────────────────────────────────────

export const getPlatformStats = async () => {
  const [users, listings, bookings, reviews, revenue, pendingReports] =
    await Promise.all([
      adminRepo.getUserStats(),
      adminRepo.getListingStats(),
      adminRepo.getBookingStats(),
      adminRepo.getReviewStatsOverview(),
      adminRepo.getRevenueStats(),
      adminRepo.getPendingReportsCount(),
    ]);

  return {
    users,
    listings,
    bookings,
    reviews,
    revenue,
    reports: { pending: pendingReports },
  };
};

// ── Analytics overview ────────────────────────────────────────────────────────

export const getAnalyticsOverview = async ({ range = "30d" } = {}) => {
  const { startDate, endDate, groupBy } = resolveDateRange(range);

  const [
    usersGrowth,
    revenueTimeseries,
    bookingsByStatus,
    listingsByCategory,
    topHosts,
  ] = await Promise.all([
    adminRepo.getUsersGrowthTimeseries(startDate, endDate, groupBy),
    adminRepo.getPlatformRevenueTimeseries(startDate, endDate, groupBy),
    adminRepo.getBookingsByStatus(),
    adminRepo.getListingsByCategory(),
    adminRepo.getTopHostsByRevenue(startDate, endDate, 5),
  ]);

  return {
    usersGrowth,
    revenueTimeseries,
    bookingsByStatus,
    listingsByCategory,
    topHosts,
    range,
  };
};

// ── User management ───────────────────────────────────────────────────────────

export const listUsers = (query) => userRepo.findPaginatedAdmin(query);

export const setUserActiveStatus = async (username, isActive, adminId) => {
  const user = await userRepo.findByUsername(username);
  if (!user) throw AppError.notFound("User not found");

  if (user.role === "admin" && !isActive) {
    throw AppError.badRequest("Admin accounts cannot be suspended");
  }

  const updated = await userRepo.setActiveStatus(user._id, isActive);

  logger.auth.info("User status changed by admin", {
    userId: user._id,
    username: user.username,
    isActive,
    adminId,
  });

  return updated;
};

// ── Listing moderation ─────────────────────────────────────────────────────────

export const listListings = (query) => listingRepo.findPaginatedAdmin(query);

export const setListingStatus = async (listingId, status, adminId, reason) => {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  const updated = await listingRepo.updateById(listingId, { status });

  logger.info("Listing status changed by admin", {
    listingId,
    status,
    adminId,
    reason: reason ?? null,
  });

  return updated;
};

// ── Review moderation ──────────────────────────────────────────────────────────

export const listReviews = (query) => reviewRepo.findPaginatedAdmin(query);
