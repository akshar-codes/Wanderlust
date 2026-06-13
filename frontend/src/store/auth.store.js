import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "../services/auth.service";

const initialState = {
  user: null,
  isLoading: true, // true until the first /me call resolves
  isAuthenticated: false,
  sessionChecked: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      init: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            sessionChecked: true,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            sessionChecked: true,
          });
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

      /** Refresh the in-memory user after email verification or role change */
      refreshUser: async () => {
        try {
          const user = await authService.me();
          set({ user });
        } catch {
          // session expired
          set({ user: null, isAuthenticated: false });
        }
      },

      /** Optimistically mark email as verified (avoids a round-trip) */
      markEmailVerified: () => {
        const { user } = get();
        if (user) set({ user: { ...user, emailVerified: true } });
      },

      // ── Role helpers ──────────────────────────────────────────────────────
      get isAdmin() {
        return get().user?.role === "admin";
      },
      get isHost() {
        const role = get().user?.role;
        return role === "host" || role === "admin";
      },
      get isEmailVerified() {
        return get().user?.emailVerified === true;
      },
    }),
    {
      name: "wl-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist lightweight non-sensitive user shape; NOT the session cookie
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              username: state.user.username,
              email: state.user.email,
              emailVerified: state.user.emailVerified,
              role: state.user.role,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              avatar: state.user.avatar ?? null,
            }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
