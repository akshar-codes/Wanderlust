import api from "./api";

export const reviewsService = {
  /** GET /api/listings/:listingId/reviews  (paginated + filtered) */
  getAll: async (
    listingId,
    { page = 1, limit = 10, sort = "recent", rating, withPhotos, keyword } = {},
  ) => {
    const params = { page, limit, sort };
    if (rating) params.rating = rating;
    if (withPhotos) params.withPhotos = true;
    if (keyword) params.keyword = keyword;

    const res = await api.get(`/listings/${listingId}/reviews`, { params });
    return res.data.data; // { reviews, pagination }
  },

  /** GET /api/listings/:listingId/reviews/stats */
  getStats: async (listingId) => {
    const res = await api.get(`/listings/${listingId}/reviews/stats`);
    return res.data.data;
  },

  /** POST /api/listings/:listingId/reviews */
  create: async (listingId, reviewData) => {
    const res = await api.post(`/listings/${listingId}/reviews`, {
      review: reviewData,
    });
    return res.data.data.review;
  },

  /** DELETE /api/listings/:listingId/reviews/:reviewId */
  delete: async (listingId, reviewId) => {
    const res = await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
    return res.data.data;
  },

  /** PATCH /api/listings/:listingId/reviews/:reviewId */
  update: async (listingId, reviewId, reviewData) => {
    const res = await api.patch(`/listings/${listingId}/reviews/${reviewId}`, {
      review: reviewData,
    });
    return res.data.data.review;
  },

  // ── Host reply ──────────────────────────────────────────────────────────────

  /** POST/PUT /api/listings/:listingId/reviews/:reviewId/reply */
  upsertHostReply: async (listingId, reviewId, text) => {
    const res = await api.post(
      `/listings/${listingId}/reviews/${reviewId}/reply`,
      { text },
    );
    return res.data.data.review;
  },

  /** DELETE /api/listings/:listingId/reviews/:reviewId/reply */
  deleteHostReply: async (listingId, reviewId) => {
    const res = await api.delete(
      `/listings/${listingId}/reviews/${reviewId}/reply`,
    );
    return res.data.data.review;
  },

  // ── Helpful votes ───────────────────────────────────────────────────────────

  /** POST /api/listings/:listingId/reviews/:reviewId/helpful */
  toggleHelpful: async (listingId, reviewId) => {
    const res = await api.post(
      `/listings/${listingId}/reviews/${reviewId}/helpful`,
    );
    return res.data.data; // { helpfulVotes, voted }
  },

  // ── Photos ──────────────────────────────────────────────────────────────────

  /** POST .../reviews/:reviewId/photos  (FormData with files[]) */
  addPhotos: async (listingId, reviewId, files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("photos", f));
    const res = await api.post(
      `/listings/${listingId}/reviews/${reviewId}/photos`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data.review;
  },

  /** DELETE .../reviews/:reviewId/photos/:photoId */
  deletePhoto: async (listingId, reviewId, photoId) => {
    const res = await api.delete(
      `/listings/${listingId}/reviews/${reviewId}/photos/${photoId}`,
    );
    return res.data.data.review;
  },
};
