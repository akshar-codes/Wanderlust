import mongoose from "mongoose";
import Booking from "../models/booking.js";
import Listing from "../models/listing.js";
import Review from "../models/review.js";

const { Types } = mongoose;

const toObjectId = (id) =>
  id instanceof Types.ObjectId ? id : new Types.ObjectId(String(id));

const TRUNC_UNIT = { day: "day", week: "week", month: "month" };

/**
 * Builds the `_id` expression for a $group stage that buckets `createdAt`
 * into day/week/month windows via $dateTrunc (MongoDB 5.0+) and formats it
 * back to a sortable "YYYY-MM-DD" string label.
 */
function dateTruncGroupId(groupBy) {
  return {
    $dateToString: {
      format: "%Y-%m-%d",
      date: {
        $dateTrunc: { date: "$createdAt", unit: TRUNC_UNIT[groupBy] ?? "day" },
      },
    },
  };
}

function baseBookingMatch(hostId, { startDate, endDate, listingId }, statuses) {
  const match = {
    host: toObjectId(hostId),
    createdAt: { $gte: startDate, $lte: endDate },
  };
  if (statuses) match.status = { $in: statuses };
  if (listingId) match.listing = toObjectId(listingId);
  return match;
}

// ── Revenue ────────────────────────────────────────────────────────────────

export const getRevenueTimeseries = async (hostId, opts, groupBy) => {
  const match = baseBookingMatch(hostId, opts, ["confirmed", "completed"]);
  return Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: dateTruncGroupId(groupBy),
        revenue: { $sum: "$pricing.total" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: 1, bookings: 1 } },
  ]);
};

export const getRevenueSummary = async (hostId, opts) => {
  const match = baseBookingMatch(hostId, opts, ["confirmed", "completed"]);
  const [row] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.total" },
        totalBookings: { $sum: 1 },
      },
    },
  ]);
  return row ?? { totalRevenue: 0, totalBookings: 0 };
};

// ── Bookings (raw docs, used for occupancy overlap math in the service) ─────

export const getBookingsInRangeForOccupancy = async (
  hostId,
  { startDate, endDate, listingId },
) => {
  const match = {
    host: toObjectId(hostId),
    status: { $in: ["confirmed", "completed"] },
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate },
  };
  if (listingId) match.listing = toObjectId(listingId);

  return Booking.find(match, {
    listing: 1,
    checkIn: 1,
    checkOut: 1,
    nights: 1,
  }).lean();
};

export const getActiveListingsCount = async (hostId, listingId) => {
  const filter = { owner: toObjectId(hostId), status: "active", draft: false };
  if (listingId) filter._id = toObjectId(listingId);
  return Listing.countDocuments(filter);
};

// ── Booking trends ─────────────────────────────────────────────────────────

export const getBookingTrendsTimeseries = async (hostId, opts, groupBy) => {
  const match = baseBookingMatch(hostId, opts, null);
  return Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: dateTruncGroupId(groupBy),
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        confirmed: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        pending: 1,
        confirmed: 1,
        cancelled: 1,
        completed: 1,
        total: 1,
      },
    },
  ]);
};

export const getBookingTrendsSummary = async (hostId, opts) => {
  const match = baseBookingMatch(hostId, opts, null);
  const [row] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        confirmed: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ]);
  return (
    row ?? { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 }
  );
};

// ── Listing performance ────────────────────────────────────────────────────

export const getHostListingsSummary = async (hostId) =>
  Listing.find({ owner: toObjectId(hostId) })
    .select(
      "title image status draft price averageRating reviewCount bookingCount wishlistCount createdAt",
    )
    .sort({ createdAt: -1 })
    .lean();

export const getRevenueByListing = async (hostId, { startDate, endDate }) => {
  const match = baseBookingMatch(hostId, { startDate, endDate }, [
    "confirmed",
    "completed",
  ]);
  return Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$listing",
        revenue: { $sum: "$pricing.total" },
        bookings: { $sum: 1 },
        nights: { $sum: "$nights" },
      },
    },
  ]);
};

// ── Reviews analytics ──────────────────────────────────────────────────────

export const getHostListingIds = async (hostId) => {
  const listings = await Listing.find(
    { owner: toObjectId(hostId) },
    { _id: 1 },
  ).lean();
  return listings.map((l) => l._id);
};

export const getReviewsOverview = async (listingIds) => {
  if (!listingIds.length) return { count: 0, avg: 0, repliedCount: 0 };
  const [row] = await Review.aggregate([
    { $match: { listing: { $in: listingIds } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avg: { $avg: "$rating" },
        avgCleanliness: { $avg: "$categoryRatings.cleanliness" },
        avgAccuracy: { $avg: "$categoryRatings.accuracy" },
        avgCheckIn: { $avg: "$categoryRatings.checkIn" },
        avgCommunication: { $avg: "$categoryRatings.communication" },
        avgLocation: { $avg: "$categoryRatings.location" },
        avgValue: { $avg: "$categoryRatings.value" },
        repliedCount: {
          $sum: { $cond: [{ $ne: ["$hostReply", null] }, 1, 0] },
        },
      },
    },
  ]);
  return row ?? { count: 0, avg: 0, repliedCount: 0 };
};

export const getReviewsDistribution = async (listingIds) => {
  if (!listingIds.length) return [];
  return Review.aggregate([
    { $match: { listing: { $in: listingIds } } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
};

export const getReviewsTrend = async (listingIds, startDate, endDate) => {
  if (!listingIds.length) return [];
  return Review.aggregate([
    {
      $match: {
        listing: { $in: listingIds },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $dateTrunc: { date: "$createdAt", unit: "week" } },
          },
        },
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        averageRating: { $round: ["$avgRating", 1] },
        count: 1,
      },
    },
  ]);
};

export const getRecentReviews = async (listingIds, limit = 5) => {
  if (!listingIds.length) return [];
  return Review.find({ listing: { $in: listingIds } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "username firstName lastName avatar")
    .populate({ path: "listing", select: "title slug" })
    .lean();
};
