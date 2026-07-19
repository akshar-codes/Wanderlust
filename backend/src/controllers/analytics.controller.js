import * as analyticsService from "../services/analytics.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── GET /api/analytics/host/summary ──────────────────────────────────────────
export const summary = async (req, res) => {
  const data = await analyticsService.getHostSummary(req.user._id, req.query);
  return sendSuccess(res, data);
};

// ── GET /api/analytics/host/revenue ──────────────────────────────────────────
export const revenue = async (req, res) => {
  const data = await analyticsService.getRevenueAnalytics(
    req.user._id,
    req.query,
  );
  return sendSuccess(res, data);
};

// ── GET /api/analytics/host/occupancy ────────────────────────────────────────
export const occupancy = async (req, res) => {
  const data = await analyticsService.getOccupancyAnalytics(
    req.user._id,
    req.query,
  );
  return sendSuccess(res, data);
};

// ── GET /api/analytics/host/booking-trends ───────────────────────────────────
export const bookingTrends = async (req, res) => {
  const data = await analyticsService.getBookingTrendsAnalytics(
    req.user._id,
    req.query,
  );
  return sendSuccess(res, data);
};

// ── GET /api/analytics/host/listing-performance ──────────────────────────────
export const listingPerformance = async (req, res) => {
  const data = await analyticsService.getListingPerformanceAnalytics(
    req.user._id,
    req.query,
  );
  return sendSuccess(res, data);
};

// ── GET /api/analytics/host/reviews ──────────────────────────────────────────
export const reviewsAnalytics = async (req, res) => {
  const data = await analyticsService.getReviewsAnalyticsData(
    req.user._id,
    req.query,
  );
  return sendSuccess(res, data);
};
