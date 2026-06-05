import api from "./api";

export const reviewsService = {
  /** GET /api/listings/:listingId/reviews */
  getAll: async (listingId) => {
    const res = await api.get(`/listings/${listingId}/reviews`);
    return res.data.data.reviews;
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
    const res = await api.delete(
      `/listings/${listingId}/reviews/${reviewId}`
    );
    return res.data.data;
  },

  /** PATCH /api/listings/:listingId/reviews/:reviewId */
  update: async (listingId, reviewId, reviewData) => {
    const res = await api.patch(
      `/listings/${listingId}/reviews/${reviewId}`,
      { review: reviewData }
    );
    return res.data.data.review;
  },
};
