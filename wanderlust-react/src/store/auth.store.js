import { create } from "zustand";
import { authService } from "../services/auth.service";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    try {
      const user = await authService.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const data = await authService.login(credentials);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  signup: async (formData) => {
    const data = await authService.signup(formData);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
