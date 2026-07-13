import api from "./api";

export const wishlistService = {
  // ── Items (within a collection) ──────────────────────────────────────────

  /** GET /api/wishlist — items in a collection (defaults to the user's default wishlist) */
  getAll: async ({ page = 1, limit = 12, collectionId } = {}) => {
    const params = { page, limit };
    if (collectionId) params.collectionId = collectionId;
    const res = await api.get("/wishlist", { params });
    return res.data.data; // { collection, items, pagination }
  },

  /** GET /api/wishlist/status/:listingId — which collections contain this listing */
  getStatus: async (listingId) => {
    const res = await api.get(`/wishlist/status/${listingId}`);
    return res.data.data; // { wishlisted, collectionIds }
  },

  /** POST /api/wishlist/:listingId — toggle save (optionally into a specific collection) */
  toggle: async (listingId, collectionId) => {
    const res = await api.post(
      `/wishlist/${listingId}`,
      collectionId ? { collectionId } : {},
    );
    return res.data.data; // { wishlisted, collectionId }
  },

  /** DELETE /api/wishlist/:listingId — remove from a collection (defaults to default wishlist) */
  remove: async (listingId, collectionId) => {
    const res = await api.delete(`/wishlist/${listingId}`, {
      params: collectionId ? { collectionId } : {},
    });
    return res.data.data;
  },

  /** POST /api/wishlist/:listingId/move — move a saved listing between collections */
  move: async (listingId, fromCollectionId, toCollectionId) => {
    const res = await api.post(`/wishlist/${listingId}/move`, {
      fromCollectionId,
      toCollectionId,
    });
    return res.data.data.item;
  },

  // ── Collections ("wishlists") ────────────────────────────────────────────

  /** GET /api/wishlists */
  getCollections: async () => {
    const res = await api.get("/wishlists");
    return res.data.data.collections;
  },

  /** POST /api/wishlists */
  createCollection: async ({ name, description }) => {
    const res = await api.post("/wishlists", { name, description });
    return res.data.data.collection;
  },

  /** GET /api/wishlists/:id */
  getCollection: async (id, { page = 1, limit = 12 } = {}) => {
    const res = await api.get(`/wishlists/${id}`, { params: { page, limit } });
    return res.data.data; // { collection, items, pagination }
  },

  /** PATCH /api/wishlists/:id */
  updateCollection: async (id, updates) => {
    const res = await api.patch(`/wishlists/${id}`, updates);
    return res.data.data.collection;
  },

  /** DELETE /api/wishlists/:id */
  deleteCollection: async (id) => {
    const res = await api.delete(`/wishlists/${id}`);
    return res.data.data;
  },

  /** POST /api/wishlists/:id/share */
  enableSharing: async (id) => {
    const res = await api.post(`/wishlists/${id}/share`);
    return res.data.data; // { collection, shareUrl }
  },

  /** DELETE /api/wishlists/:id/share */
  disableSharing: async (id) => {
    const res = await api.delete(`/wishlists/${id}/share`);
    return res.data.data;
  },

  /** GET /api/wishlists/shared/:token — public, no auth required */
  getShared: async (token, { page = 1, limit = 12 } = {}) => {
    const res = await api.get(`/wishlists/shared/${token}`, {
      params: { page, limit },
    });
    return res.data.data; // { collection, items, pagination }
  },
};

export default wishlistService;
