import api from "./api";

export const wishlistService = {
  /** GET /api/wishlist */
  getAll: async ({ page = 1, limit = 12 } = {}) => {
    const res = await api.get("/wishlist", { params: { page, limit } });
    return res.data.data; // { items, pagination }
  },

  /** POST /api/wishlist/:listingId — toggles add/remove */
  toggle: async (listingId) => {
    const res = await api.post(`/wishlist/${listingId}`);
    return res.data.data; // { wishlisted }
  },

  /** DELETE /api/wishlist/:listingId */
  remove: async (listingId) => {
    const res = await api.delete(`/wishlist/${listingId}`);
    return res.data.data;
  },
};

export default wishlistService;
