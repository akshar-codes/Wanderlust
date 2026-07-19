import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

export const ANALYTICS_KEY = "host-analytics";

const analyticsKeys = {
  summary: (params) => [ANALYTICS_KEY, "summary", params],
  revenue: (params) => [ANALYTICS_KEY, "revenue", params],
  occupancy: (params) => [ANALYTICS_KEY, "occupancy", params],
  bookingTrends: (params) => [ANALYTICS_KEY, "booking-trends", params],
  listingPerformance: (params) => [
    ANALYTICS_KEY,
    "listing-performance",
    params,
  ],
  reviews: (params) => [ANALYTICS_KEY, "reviews", params],
};

const DEFAULT_STALE_TIME = 1000 * 60 * 2; // 2 min

export function useAnalyticsSummary(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.summary(params),
    queryFn: () => analyticsService.getSummary(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}

export function useRevenueAnalytics(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenue(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}

export function useOccupancyAnalytics(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.occupancy(params),
    queryFn: () => analyticsService.getOccupancy(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}

export function useBookingTrends(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.bookingTrends(params),
    queryFn: () => analyticsService.getBookingTrends(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}

export function useListingPerformance(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.listingPerformance(params),
    queryFn: () => analyticsService.getListingPerformance(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}

export function useReviewsAnalytics(params = {}, opts = {}) {
  return useQuery({
    queryKey: analyticsKeys.reviews(params),
    queryFn: () => analyticsService.getReviewsAnalytics(params),
    staleTime: DEFAULT_STALE_TIME,
    ...opts,
  });
}
