import api from "./api";

export const authService = {
  /** POST /api/auth/signup */
  signup: async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data.data;
  },

  /** POST /api/auth/login */
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data.data;
  },

  /** POST /api/auth/logout */
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data.data;
  },

  /** GET /api/auth/me */
  me: async () => {
    const res = await api.get("/auth/me");
    return res.data.data.user;
  },
};
