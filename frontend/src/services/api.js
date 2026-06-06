import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Response interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    }

    // Normalise: every caller sees a plain error.message string
    error.message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(error);
  },
);

export default api;
