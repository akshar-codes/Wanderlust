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

  // ── Host workflow ────────────────────────────────────────────────────────

  /** GET /api/bookings/host — bookings received on the current user's listings */
  getHostAll: async ({ page = 1, limit = 10, status } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/bookings/host", { params });
    return res.data.data; // { bookings, pagination }
  },

  /** PATCH /api/bookings/:id/confirm */
  confirm: async (id) => {
    const res = await api.patch(`/bookings/${id}/confirm`);
    return res.data.data.booking;
  },

  /** PATCH /api/bookings/:id/decline */
  decline: async (id, reason) => {
    const res = await api.patch(`/bookings/${id}/decline`, { reason });
    return res.data.data.booking;
  },

  /** PATCH /api/bookings/:id/complete */
  complete: async (id) => {
    const res = await api.patch(`/bookings/${id}/complete`);
    return res.data.data.booking;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  /** GET /api/bookings/admin */
  adminGetAll: async ({
    page = 1,
    limit = 20,
    status,
    listingId,
    guestId,
    hostId,
  } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (listingId) params.listingId = listingId;
    if (guestId) params.guestId = guestId;
    if (hostId) params.hostId = hostId;
    const res = await api.get("/bookings/admin", { params });
    return res.data.data; // { bookings, pagination }
  },

  /** PATCH /api/bookings/admin/:id/status */
  adminUpdateStatus: async (id, status, reason) => {
    const res = await api.patch(`/bookings/admin/${id}/status`, {
      status,
      reason,
    });
    return res.data.data.booking;
  },
};

export default bookingsService;
