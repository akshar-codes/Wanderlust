import * as analyticsRepo from "../repositories/analytics.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";
import { resolveDateRange, pctChange } from "../utils/dateUtils.js";

// ── Shared helpers ─────────────────────────────────────────────────────────

async function assertOwnsListing(hostId, listingId) {
  if (!listingId) return;
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");
  if (String(listing.owner) !== String(hostId)) {
    throw AppError.forbidden("You do not own this listing");
  }
}

/** Zero-fills gaps so daily-granularity charts never show misleading jumps. */
function fillDailyTimeseries(rows, startDate, endDate, valueKeys) {
  const map = new Map(rows.map((r) => [r.date, r]));
  const result = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const existing = map.get(key);
    const entry = { date: key };
    valueKeys.forEach((k) => {
      entry[k] = existing?.[k] ?? 0;
    });
    result.push(entry);
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

/** Sum of nights a single booking overlaps with [startDate, endDate). */
function overlapNights(booking, startDate, endDate) {
  const s = new Date(
    Math.max(new Date(booking.checkIn).getTime(), startDate.getTime()),
  );
  const e = new Date(
    Math.min(new Date(booking.checkOut).getTime(), endDate.getTime()),
  );
  const ms = e.getTime() - s.getTime();
  return ms > 0 ? Math.round(ms / (24 * 60 * 60 * 1000)) : 0;
}

// ── Revenue ────────────────────────────────────────────────────────────────

export const getRevenueAnalytics = async (hostId, query) => {
  const { range, listingId } = query;
  await assertOwnsListing(hostId, listingId);

  const { startDate, endDate, prevStartDate, prevEndDate, groupBy } =
    resolveDateRange(range);

  const [timeseriesRaw, currentSummary, prevSummary] = await Promise.all([
    analyticsRepo.getRevenueTimeseries(
      hostId,
      { startDate, endDate, listingId },
      groupBy,
    ),
    analyticsRepo.getRevenueSummary(hostId, { startDate, endDate, listingId }),
    analyticsRepo.getRevenueSummary(hostId, {
      startDate: prevStartDate,
      endDate: prevEndDate,
      listingId,
    }),
  ]);

  const timeseries =
    groupBy === "day"
      ? fillDailyTimeseries(timeseriesRaw, startDate, endDate, [
          "revenue",
          "bookings",
        ])
      : timeseriesRaw;

  const totalRevenue = currentSummary.totalRevenue ?? 0;
  const totalBookings = currentSummary.totalBookings ?? 0;

  return {
    summary: {
      totalRevenue,
      totalBookings,
      avgBookingValue:
        totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
      revenueChangePct: pctChange(totalRevenue, prevSummary.totalRevenue ?? 0),
      bookingsChangePct: pctChange(
        totalBookings,
        prevSummary.totalBookings ?? 0,
      ),
    },
    timeseries,
    range,
  };
};

// ── Occupancy ──────────────────────────────────────────────────────────────

function buildDailyOccupancy(bookings, listingsCount, startDate, endDate) {
  const days = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const bookedCount = bookings.filter(
      (b) => new Date(b.checkIn) < dayEnd && new Date(b.checkOut) > dayStart,
    ).length;

    days.push({
      date: dayStart.toISOString().slice(0, 10),
      occupancyRate:
        listingsCount > 0
          ? Math.round((bookedCount / listingsCount) * 1000) / 10
          : 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Buckets a daily occupancy series into week/month averages for longer ranges. */
function bucketOccupancy(dailyRates, groupBy) {
  if (groupBy === "day") return dailyRates;
  const bucketSize = groupBy === "week" ? 7 : 30;
  const buckets = [];
  for (let i = 0; i < dailyRates.length; i += bucketSize) {
    const chunk = dailyRates.slice(i, i + bucketSize);
    const avg = chunk.reduce((s, d) => s + d.occupancyRate, 0) / chunk.length;
    buckets.push({
      date: chunk[0].date,
      occupancyRate: Math.round(avg * 10) / 10,
    });
  }
  return buckets;
}

export const getOccupancyAnalytics = async (hostId, query) => {
  const { range, listingId } = query;
  await assertOwnsListing(hostId, listingId);

  const { startDate, endDate, prevStartDate, prevEndDate, days, groupBy } =
    resolveDateRange(range);

  const [bookings, prevBookings, listingsCount, listingsSummary] =
    await Promise.all([
      analyticsRepo.getBookingsInRangeForOccupancy(hostId, {
        startDate,
        endDate,
        listingId,
      }),
      analyticsRepo.getBookingsInRangeForOccupancy(hostId, {
        startDate: prevStartDate,
        endDate: prevEndDate,
        listingId,
      }),
      analyticsRepo.getActiveListingsCount(hostId, listingId),
      analyticsRepo.getHostListingsSummary(hostId),
    ]);

  const dailyRates = buildDailyOccupancy(
    bookings,
    listingsCount,
    startDate,
    endDate,
  );
  const timeseries = bucketOccupancy(dailyRates, groupBy);

  const avgOccupancy =
    dailyRates.length > 0
      ? Math.round(
          (dailyRates.reduce((s, d) => s + d.occupancyRate, 0) /
            dailyRates.length) *
            10,
        ) / 10
      : 0;

  // Active-listing count is assumed roughly stable across the comparison
  // window; re-deriving a historical count is not worth the extra query.
  const prevDailyRates = buildDailyOccupancy(
    prevBookings,
    listingsCount,
    prevStartDate,
    prevEndDate,
  );
  const prevAvgOccupancy =
    prevDailyRates.length > 0
      ? prevDailyRates.reduce((s, d) => s + d.occupancyRate, 0) /
        prevDailyRates.length
      : 0;

  const bookedNights = bookings.reduce(
    (s, b) => s + overlapNights(b, startDate, endDate),
    0,
  );
  const availableNights = listingsCount * days;

  const byListing = listingId
    ? []
    : listingsSummary.map((l) => {
        const listingBookings = bookings.filter(
          (b) => String(b.listing) === String(l._id),
        );
        const nights = listingBookings.reduce(
          (s, b) => s + overlapNights(b, startDate, endDate),
          0,
        );
        return {
          listingId: l._id,
          title: l.title,
          occupancyRate: days > 0 ? Math.round((nights / days) * 1000) / 10 : 0,
        };
      });

  return {
    summary: {
      occupancyRate: avgOccupancy,
      bookedNights,
      availableNights,
      occupancyChangePct: pctChange(avgOccupancy, prevAvgOccupancy),
    },
    timeseries,
    byListing: byListing.sort((a, b) => b.occupancyRate - a.occupancyRate),
    range,
  };
};

// ── Booking trends ─────────────────────────────────────────────────────────

export const getBookingTrendsAnalytics = async (hostId, query) => {
  const { range, listingId } = query;
  await assertOwnsListing(hostId, listingId);

  const { startDate, endDate, groupBy } = resolveDateRange(range);

  const [timeseriesRaw, summary] = await Promise.all([
    analyticsRepo.getBookingTrendsTimeseries(
      hostId,
      { startDate, endDate, listingId },
      groupBy,
    ),
    analyticsRepo.getBookingTrendsSummary(hostId, {
      startDate,
      endDate,
      listingId,
    }),
  ]);

  const timeseries =
    groupBy === "day"
      ? fillDailyTimeseries(timeseriesRaw, startDate, endDate, [
          "pending",
          "confirmed",
          "cancelled",
          "completed",
          "total",
        ])
      : timeseriesRaw;

  const total = summary.total ?? 0;
  const cancelled = summary.cancelled ?? 0;

  return {
    summary: {
      ...summary,
      cancellationRate:
        total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0,
    },
    timeseries,
    range,
  };
};

// ── Listing performance ────────────────────────────────────────────────────

export const getListingPerformanceAnalytics = async (hostId, query) => {
  const { range } = query;
  const { startDate, endDate, days } = resolveDateRange(range);

  const [listings, revenueRows] = await Promise.all([
    analyticsRepo.getHostListingsSummary(hostId),
    analyticsRepo.getRevenueByListing(hostId, { startDate, endDate }),
  ]);

  const revenueMap = new Map(revenueRows.map((r) => [String(r._id), r]));

  const results = listings.map((l) => {
    const stats = revenueMap.get(String(l._id));
    const bookedNights = stats?.nights ?? 0;
    return {
      listingId: l._id,
      title: l.title,
      image: l.image?.url ?? null,
      status: l.status,
      draft: l.draft,
      price: l.price,
      averageRating: l.averageRating ?? 0,
      reviewCount: l.reviewCount ?? 0,
      lifetimeBookings: l.bookingCount ?? 0,
      wishlistCount: l.wishlistCount ?? 0,
      periodRevenue: stats?.revenue ?? 0,
      periodBookings: stats?.bookings ?? 0,
      occupancyRate:
        days > 0 ? Math.round((bookedNights / days) * 1000) / 10 : 0,
    };
  });

  results.sort((a, b) => b.periodRevenue - a.periodRevenue);

  return { listings: results, range };
};

// ── Reviews analytics ──────────────────────────────────────────────────────

export const getReviewsAnalyticsData = async (hostId, query) => {
  const { range } = query;
  const { startDate, endDate } = resolveDateRange(range);

  const listingIds = await analyticsRepo.getHostListingIds(hostId);

  const [overview, distributionRows, trend, recentReviews] = await Promise.all([
    analyticsRepo.getReviewsOverview(listingIds),
    analyticsRepo.getReviewsDistribution(listingIds),
    analyticsRepo.getReviewsTrend(listingIds, startDate, endDate),
    analyticsRepo.getRecentReviews(listingIds, 5),
  ]);

  const totalReviews = overview.count ?? 0;
  const distMap = Object.fromEntries(
    distributionRows.map((d) => [d._id, d.count]),
  );
  const round1 = (v) => (v != null ? Math.round(v * 10) / 10 : null);

  return {
    summary: {
      averageRating:
        totalReviews > 0 ? Math.round((overview.avg ?? 0) * 10) / 10 : 0,
      totalReviews,
      responseRate:
        totalReviews > 0
          ? Math.round(((overview.repliedCount ?? 0) / totalReviews) * 1000) /
            10
          : 0,
    },
    distribution: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: distMap[star] ?? 0,
      pct:
        totalReviews > 0
          ? Math.round(((distMap[star] ?? 0) / totalReviews) * 1000) / 10
          : 0,
    })),
    categoryAverages: {
      cleanliness: round1(overview.avgCleanliness),
      accuracy: round1(overview.avgAccuracy),
      checkIn: round1(overview.avgCheckIn),
      communication: round1(overview.avgCommunication),
      location: round1(overview.avgLocation),
      value: round1(overview.avgValue),
    },
    trend,
    recentReviews,
    range,
  };
};

// ── Summary (top KPI cards) ──────────────────────────────────────────────────

export const getHostSummary = async (hostId, query) => {
  const { range } = query;
  const { startDate, endDate } = resolveDateRange(range);

  const [
    revenueSummary,
    bookingSummary,
    activeListingsCount,
    listingsSummary,
    listingIds,
    bookingsForOccupancy,
  ] = await Promise.all([
    analyticsRepo.getRevenueSummary(hostId, { startDate, endDate }),
    analyticsRepo.getBookingTrendsSummary(hostId, { startDate, endDate }),
    analyticsRepo.getActiveListingsCount(hostId),
    analyticsRepo.getHostListingsSummary(hostId),
    analyticsRepo.getHostListingIds(hostId),
    analyticsRepo.getBookingsInRangeForOccupancy(hostId, {
      startDate,
      endDate,
    }),
  ]);

  const reviewsOverview = await analyticsRepo.getReviewsOverview(listingIds);

  const bookedNights = bookingsForOccupancy.reduce(
    (s, b) => s + overlapNights(b, startDate, endDate),
    0,
  );
  const rangeDays = Math.max(
    1,
    Math.round((endDate - startDate) / (24 * 60 * 60 * 1000)),
  );
  const availableNights = activeListingsCount * rangeDays;

  return {
    totalRevenue: revenueSummary.totalRevenue ?? 0,
    totalBookings: bookingSummary.total ?? 0,
    pendingBookings: bookingSummary.pending ?? 0,
    activeListings: activeListingsCount,
    totalListings: listingsSummary.length,
    occupancyRate:
      availableNights > 0
        ? Math.round((bookedNights / availableNights) * 1000) / 10
        : 0,
    averageRating:
      reviewsOverview.count > 0
        ? Math.round((reviewsOverview.avg ?? 0) * 10) / 10
        : 0,
    totalReviews: reviewsOverview.count ?? 0,
    range,
  };
};
