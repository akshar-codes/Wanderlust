import api from "./api";

export const analyticsService = {
  /** GET /api/analytics/host/summary */
  getSummary: async (params = {}) => {
    const res = await api.get("/analytics/host/summary", { params });
    return res.data.data;
  },

  /** GET /api/analytics/host/revenue */
  getRevenue: async (params = {}) => {
    const res = await api.get("/analytics/host/revenue", { params });
    return res.data.data;
  },

  /** GET /api/analytics/host/occupancy */
  getOccupancy: async (params = {}) => {
    const res = await api.get("/analytics/host/occupancy", { params });
    return res.data.data;
  },

  /** GET /api/analytics/host/booking-trends */
  getBookingTrends: async (params = {}) => {
    const res = await api.get("/analytics/host/booking-trends", { params });
    return res.data.data;
  },

  /** GET /api/analytics/host/listing-performance */
  getListingPerformance: async (params = {}) => {
    const res = await api.get("/analytics/host/listing-performance", {
      params,
    });
    return res.data.data;
  },

  /** GET /api/analytics/host/reviews */
  getReviewsAnalytics: async (params = {}) => {
    const res = await api.get("/analytics/host/reviews", { params });
    return res.data.data;
  },
};

export default analyticsService;
