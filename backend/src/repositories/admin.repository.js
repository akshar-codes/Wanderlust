import User from "../models/user.js";
import Listing from "../models/listing.js";
import Review from "../models/review.js";
import Booking from "../models/booking.js";
import Report from "../models/report.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const TRUNC_UNIT = { day: "day", week: "week", month: "month" };

/**
 * Builds a $group `_id` expression that buckets a date field into
 * day/week/month windows and formats it back to a sortable "YYYY-MM-DD"
 * label — mirrors the pattern already used in analytics.repository.js.
 */
function dateTruncGroupId(field, groupBy) {
  return {
    $dateToString: {
      format: "%Y-%m-%d",
      date: {
        $dateTrunc: { date: `$${field}`, unit: TRUNC_UNIT[groupBy] ?? "day" },
      },
    },
  };
}

// ── Platform statistics ───────────────────────────────────────────────────────

export const getUserStats = async () => {
  const [total, hosts, admins, active, newLast30Days] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "host" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * DAY_MS) },
    }),
  ]);
  return {
    total,
    hosts,
    admins,
    active,
    suspended: total - active,
    newLast30Days,
  };
};

export const getListingStats = async () => {
  const [total, active, draft, suspended, featured] = await Promise.all([
    Listing.countDocuments({}),
    Listing.countDocuments({ status: "active", draft: false }),
    Listing.countDocuments({ draft: true }),
    Listing.countDocuments({ status: "suspended" }),
    Listing.countDocuments({ featured: true }),
  ]);
  return { total, active, draft, suspended, featured };
};

export const getBookingStats = async () => {
  const rows = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const total = rows.reduce((s, r) => s + r.count, 0);
  return {
    total,
    pending: byStatus.pending ?? 0,
    confirmed: byStatus.confirmed ?? 0,
    completed: byStatus.completed ?? 0,
    cancelled: byStatus.cancelled ?? 0,
  };
};

export const getReviewStatsOverview = async () => {
  const [row] = await Review.aggregate([
    { $group: { _id: null, total: { $sum: 1 }, avg: { $avg: "$rating" } } },
  ]);
  return {
    total: row?.total ?? 0,
    averageRating: row?.avg ? Math.round(row.avg * 10) / 10 : 0,
  };
};

export const getRevenueStats = async () => {
  const [allTime, last30Days] = await Promise.all([
    Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } },
    ]),
    Booking.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
          createdAt: { $gte: new Date(Date.now() - 30 * DAY_MS) },
        },
      },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } },
    ]),
  ]);
  return {
    total: allTime[0]?.total ?? 0,
    last30Days: last30Days[0]?.total ?? 0,
  };
};

export const getPendingReportsCount = () =>
  Report.countDocuments({ status: "pending" });

// ── Platform-wide analytics timeseries ────────────────────────────────────────

export const getUsersGrowthTimeseries = (startDate, endDate, groupBy) =>
  User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: dateTruncGroupId("createdAt", groupBy),
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", count: 1 } },
  ]);

export const getPlatformRevenueTimeseries = (startDate, endDate, groupBy) =>
  Booking.aggregate([
    {
      $match: {
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: dateTruncGroupId("createdAt", groupBy),
        revenue: { $sum: "$pricing.total" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: 1, bookings: 1 } },
  ]);

export const getBookingsByStatus = () =>
  Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ]);

export const getListingsByCategory = () =>
  Listing.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);

export const getTopHostsByRevenue = (startDate, endDate, limit = 5) =>
  Booking.aggregate([
    {
      $match: {
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$host",
        revenue: { $sum: "$pricing.total" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "host",
      },
    },
    { $unwind: "$host" },
    {
      $project: {
        _id: 0,
        hostId: "$_id",
        username: "$host.username",
        firstName: "$host.firstName",
        lastName: "$host.lastName",
        avatar: "$host.avatar.url",
        revenue: 1,
        bookings: 1,
      },
    },
  ]);
