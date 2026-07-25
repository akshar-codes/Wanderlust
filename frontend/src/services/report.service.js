import api from "./api";

export const reportService = {
  /** POST /api/reports — report a listing, review, or user */
  create: async (payload) => {
    const res = await api.post("/reports", payload);
    return res.data.data;
  },

  /** GET /api/reports — moderation queue (admin) */
  getAll: async (params = {}) => {
    const res = await api.get("/reports", { params });
    return res.data.data;
  },

  /** PATCH /api/reports/:id/resolve (admin) */
  resolve: async (id, payload) => {
    const res = await api.patch(`/reports/${id}/resolve`, payload);
    return res.data.data;
  },
};

export default reportService;
