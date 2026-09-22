import api from "./api";

export const notificationsService = {
  getAll: async ({ page = 1, limit = 10 } = {}) => {
    const { data } = await api.get("/notifications", { params: { page, limit } });
    return data.data;
  },
  getUnreadCount: async () => {
    const { data } = await api.get("/notifications/unread-count");
    return data.data;
  },
  markRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },
  markAllRead: async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data.data;
  },
};
