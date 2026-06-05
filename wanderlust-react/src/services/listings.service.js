import api from "./api";

export const listingsService = {
  /** GET /api/listings?category=&page=&limit= */
  getAll: async (params = {}) => {
    const res = await api.get("/listings", { params });
    return res.data.data; // { listings, pagination }
  },

  /** GET /api/listings/:id */
  getById: async (id) => {
    const res = await api.get(`/listings/${id}`);
    return res.data.data.listing;
  },

  /** POST /api/listings  (multipart/form-data) */
  create: async (formData) => {
    const res = await api.post("/listings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.listing;
  },

  /** PUT /api/listings/:id  (multipart/form-data) */
  update: async (id, formData) => {
    const res = await api.put(`/listings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.listing;
  },

  /** DELETE /api/listings/:id */
  delete: async (id) => {
    const res = await api.delete(`/listings/${id}`);
    return res.data.data;
  },
};
