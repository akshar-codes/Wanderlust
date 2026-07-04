import api from "./api";

export const bookingsService = {
  /** GET /api/bookings — the current user's bookings as a guest */
  getAll: async ({ page = 1, limit = 10, status } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/bookings", { params });
    return res.data.data; // { bookings, pagination }
  },

  /** POST /api/bookings */
  create: async (payload) => {
    const res = await api.post("/bookings", payload);
    return res.data.data.booking;
  },

  /** PATCH /api/bookings/:id/cancel */
  cancel: async (id, reason) => {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason });
    return res.data.data.booking;
  },
};

export default bookingsService;
