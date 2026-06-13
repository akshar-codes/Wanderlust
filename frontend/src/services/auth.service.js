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

  /** POST /api/auth/forgot-password */
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data.data;
  },

  /** POST /api/auth/reset-password */
  resetPassword: async ({ token, password, confirmPassword }) => {
    const res = await api.post("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
    return res.data.data;
  },

  /** POST /api/auth/verify-email */
  verifyEmail: async (token) => {
    const res = await api.post("/auth/verify-email", { token });
    return res.data.data;
  },

  /** POST /api/auth/resend-verification */
  resendVerification: async () => {
    const res = await api.post("/auth/resend-verification");
    return res.data.data;
  },
};
