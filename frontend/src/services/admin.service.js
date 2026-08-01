import api from "./api.js";

export const adminService = {
  // Platform statistics
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  
  // Analytics
  getAnalytics: (params) => api.get("/admin/analytics", { params }).then((r) => r.data),
  
  // User management
  getUsers: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  updateUserStatus: (username, isActive, reason) =>
    api.patch(`/admin/users/${username}/status`, { isActive, reason }).then((r) => r.data),
    
  // Listing moderation
  getListings: (params) => api.get("/admin/listings", { params }).then((r) => r.data),
  updateListingStatus: (id, status, reason) =>
    api.patch(`/admin/listings/${id}/status`, { status, reason }).then((r) => r.data),
    
  // Review moderation
  getReviews: (params) => api.get("/admin/reviews", { params }).then((r) => r.data),
};
