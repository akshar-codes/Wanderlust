import api from "./api";

export const userService = {
  /** GET /api/users/:username — full profile when self, public profile otherwise */
  getProfile: async (username) => {
    const res = await api.get(`/users/${username}`);
    return res.data.data.user;
  },

  /** GET /api/users/:username — same endpoint as getProfile, but returns the */
  getProfileFull: async (username) => {
    const res = await api.get(`/users/${username}`);
    return res.data.data; // { user, hostStats }
  },

  /** PATCH /api/users/:username/profile */
  updateProfile: async (username, data) => {
    const res = await api.patch(`/users/${username}/profile`, data);
    return res.data.data.user;
  },

  /** PUT /api/users/:username/avatar */
  updateAvatar: async (username, file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await api.put(`/users/${username}/avatar`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.user;
  },

  /** DELETE /api/users/:username/avatar */
  removeAvatar: async (username) => {
    const res = await api.delete(`/users/${username}/avatar`);
    return res.data.data.user;
  },

  /** PATCH /api/users/:username/settings */
  updateSettings: async (username, settings) => {
    const res = await api.patch(`/users/${username}/settings`, settings);
    return res.data.data.settings;
  },

  /** PATCH /api/users/:username/notifications */
  updateNotificationPreferences: async (username, prefs) => {
    const res = await api.patch(`/users/${username}/notifications`, prefs);
    return res.data.data.notificationPreferences;
  },

  /** GET /api/users/:username/listings */
  getUserListings: async (username) => {
    const res = await api.get(`/users/${username}/listings`);
    return res.data.data.listings;
  },

  /** GET /api/users/:username/reviews-received — paginated reviews across*/
  getReviewsReceived: async (username, { page = 1, limit = 10 } = {}) => {
    const res = await api.get(`/users/${username}/reviews-received`, {
      params: { page, limit },
    });
    return res.data.data; // { reviews, pagination }
  },

  /**
   * DELETE /api/users/:username
   * Permanently deletes the account (self, or admin acting on another
   * account). Backend cascades avatar cleanup on Cloudinary.
   */
  deleteAccount: async (username) => {
    const res = await api.delete(`/users/${username}`);
    return res.data.data;
  },
};

export default userService;
