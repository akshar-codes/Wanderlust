import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { wanderlustTheme, injectCSSVariables } from "./theme";
import { useAuthStore } from "./store/auth.store";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Route guards
import {
  ProtectedRoute,
  GuestRoute,
  RoleRoute,
  EmailVerifiedRoute,
} from "./components/auth/RouteGuards";

// Pages
import HomePage from "./pages/HomePage";
import NewListingPage from "./pages/NewListingPage";
import EditListingPage from "./pages/EditListingPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import WishlistPage from "./pages/WishlistPage";
import SharedWishlistPage from "./pages/SharedWishlistPage";
import AdminLayout from "./pages/admin/AdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import { PrivacyPage, TermsPage } from "./pages/LegalPages";
import NotFoundPage from "./pages/NotFoundPage";
import DesignSystemPage from "./pages/DesignSystemPage";

// Mobile-aware responsive wrappers — pick the mobile-optimized page below
// the breakpoint and the existing desktop page above it, sharing the same
// data hooks either way (see components/mobile/Responsive*.jsx).
import {
  ResponsiveListingsPage,
  ResponsiveListingShowPage,
  ResponsiveWishlistCollectionPage,
} from "./components/mobile";
import MobileProfilePage from "./pages/mobile/MobileProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 min
    },
  },
});

function AuthInit({ children }) {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
    injectCSSVariables();
  }, [init]);
  return children;
}

export default function App() {
  const isDev = import.meta.env.DEV;

  return (
    <ThemeProvider theme={wanderlustTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <AuthInit>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  {/* ── Public ───────────────────────────────────────────── */}
                  <Route index element={<HomePage />} />
                  <Route path="listings" element={<ResponsiveListingsPage />} />
                  <Route path="listings/:id" element={<ResponsiveListingShowPage />} />

                  {/* ── User profile (public — self gets editable sections) ── */}
                  <Route path="users/:username" element={<UserProfilePage />} />

                  {/* ── Protected — authenticated + email verified ────────── */}
                  <Route
                    path="listings/new"
                    element={
                      <EmailVerifiedRoute>
                        <NewListingPage />
                      </EmailVerifiedRoute>
                    }
                  />
                  <Route
                    path="listings/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditListingPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── User dashboard (protected) ─────────────────────────── */}
                  <Route
                    path="dashboard/:section?"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Mobile account hub (Airbnb-style "Profile" tab) ────── */}
                  <Route
                    path="account"
                    element={
                      <ProtectedRoute>
                        <MobileProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Account settings (protected) ───────────────────────── */}
                  <Route
                    path="settings/:section?"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Admin dashboard (protected, admin role only) ───────── */}
                  <Route
                    path="admin/:section?"
                    element={
                      <RoleRoute roles={["admin"]}>
                        <AdminLayout />
                      </RoleRoute>
                    }
                  />

                  {/* ── Wishlists ──────────────────────────────────────────── */}
                  <Route
                    path="wishlist/shared/:token"
                    element={<SharedWishlistPage />}
                  />
                  <Route
                    path="wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="wishlist/:id"
                    element={
                      <ProtectedRoute>
                        <ResponsiveWishlistCollectionPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Auth pages (redirect away if already logged in) ───── */}
                  <Route
                    path="login"
                    element={
                      <GuestRoute>
                        <LoginPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="signup"
                    element={
                      <GuestRoute>
                        <SignupPage />
                      </GuestRoute>
                    }
                  />

                  {/* ── Password recovery (always public) ────────────────── */}
                  <Route
                    path="forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="reset-password"
                    element={<ResetPasswordPage />}
                  />

                  {/* ── Email verification ────────────────────────────────── */}
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route
                    path="verify-email/pending"
                    element={<VerifyEmailPage />}
                  />

                  {/* ── Legal ────────────────────────────────────────────── */}
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />

                  {/* ── Dev-only ─────────────────────────────────────────── */}
                  {isDev && (
                    <Route
                      path="design-system"
                      element={<DesignSystemPage />}
                    />
                  )}

                  {/* ── 404 ──────────────────────────────────────────────── */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AuthInit>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
