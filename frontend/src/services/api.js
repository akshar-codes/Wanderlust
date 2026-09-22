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

// ── Request interceptor (CSRF) ─────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (!["get", "head", "options"].includes(config.method?.toLowerCase())) {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
    if (match) config.headers["X-CSRF-Token"] = decodeURIComponent(match[1]);
  }
  return config;
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
