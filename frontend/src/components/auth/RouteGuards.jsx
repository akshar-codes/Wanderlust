import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Spinner } from "../common/GlobalStates";

/** Full-screen loading screen shown while the session is being hydrated */
function SplashLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100svh",
        background: "#faf8f6",
        gap: 16,
        flexDirection: "column",
      }}
    >
      <Spinner size={36} />
      <p style={{ fontSize: "0.875rem", color: "#8a8179", fontWeight: 500 }}>
        Loading Wanderlust…
      </p>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <SplashLoader />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return children;
}

export function RoleRoute({ children, roles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <SplashLoader />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  const hasRole = roles.length === 0 || roles.includes(user?.role);
  if (!hasRole) {
    return <Navigate to="/listings" replace />;
  }

  return children;
}

/**
 * Requires the logged-in user to have a verified email.
 * Shows an in-page banner if not yet verified rather than redirecting.
 */
export function EmailVerifiedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <SplashLoader />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (!user?.emailVerified) {
    return <Navigate to="/verify-email/pending" replace />;
  }

  return children;
}

/**
 * Redirects already-authenticated users away from auth pages (login/signup).
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <SplashLoader />;

  if (isAuthenticated) {
    return <Navigate to="/listings" replace />;
  }

  return children;
}
