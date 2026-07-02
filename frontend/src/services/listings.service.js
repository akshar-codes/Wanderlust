import api from "./api";

export const listingsService = {
  getAll: async (params = {}) => {
    const res = await api.get("/listings", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/listings/${id}`);
    return res.data.data.listing;
  },
  create: async (formData) => {
    const res = await api.post("/listings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.listing;
  },
  update: async (id, formData) => {
    const res = await api.put(`/listings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.listing;
  },
  delete: async (id) => {
    const res = await api.delete(`/listings/${id}`);
    return res.data.data;
  },

  /** POST /api/listings/:id/images — used to add photos beyond the wizard's cover image */
  addImages: async (id, files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    const res = await api.post(`/listings/${id}/images`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.listing;
  },
};

export default listingsService;
