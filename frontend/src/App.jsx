import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider, CssBaseline } from "@mui/material";
import {
  wanderlustTheme,
  getWanderlustTheme,
  injectCSSVariables,
} from "./theme";
import { useAuthStore } from "./store/auth.store";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

import ListingsPage from "./pages/ListingsPage";
import ListingShowPage from "./pages/ListingShowPage";
import NewListingPage from "./pages/NewListingPage";
import EditListingPage from "./pages/EditListingPage";
import LoginPage from "./pages/LoginPage";
import { SignupPage } from "./pages/AuthPages";
import { PrivacyPage, TermsPage } from "./pages/LegalPages";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";

import DesignSystemPage from "./pages/DesignSystemPage";

const theme = getWanderlustTheme("dark");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
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
                  <Route index element={<HomePage />} />
                  <Route path="listings" element={<ListingsPage />} />
                  <Route path="listings" element={<ListingsPage />} />

                  <Route
                    path="listings/new"
                    element={
                      <ProtectedRoute>
                        <NewListingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="listings/:id" element={<ListingShowPage />} />
                  <Route
                    path="listings/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditListingPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />

                  {/* Dev-only design system explorer */}
                  {isDev && (
                    <Route
                      path="design-system"
                      element={<DesignSystemPage />}
                    />
                  )}

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
