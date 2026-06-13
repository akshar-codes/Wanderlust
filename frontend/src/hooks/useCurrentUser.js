import { useAuthStore } from "../store/auth.store";

/** Returns the full user object or null */
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

/** Returns { isAuthenticated, isLoading, sessionChecked } */
export function useAuthStatus() {
  return useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
    sessionChecked: s.sessionChecked,
  }));
}

/** True if user is admin */
export function useIsAdmin() {
  return useAuthStore((s) => s.user?.role === "admin");
}

/** True if user is host OR admin */
export function useIsHost() {
  return useAuthStore((s) => {
    const role = s.user?.role;
    return role === "host" || role === "admin";
  });
}

/** True if email has been verified */
export function useIsEmailVerified() {
  return useAuthStore((s) => s.user?.emailVerified === true);
}

export function useIsOwner(userId) {
  return useAuthStore((s) => {
    if (!s.user || !userId) return false;
    return String(s.user.id) === String(userId);
  });
}

export function useCanDo(action) {
  return useAuthStore((s) => {
    const { user } = s;
    if (!user) return false;
    switch (action) {
      case "canCreateListing":
        return (
          (user.role === "host" || user.role === "admin") && user.emailVerified
        );
      case "canManageAny":
        return user.role === "admin";
      default:
        return false;
    }
  });
}
