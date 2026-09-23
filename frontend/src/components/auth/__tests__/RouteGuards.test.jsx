import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "../RouteGuards";
import { useAuthStore } from "../../../store/auth.store";

vi.mock("../../../store/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

describe("RouteGuards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ProtectedRoute", () => {
    it("redirects to /login when unauthenticated", () => {
      useAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("renders children when authenticated", () => {
      useAuthStore.mockReturnValue({ isAuthenticated: true, isLoading: false });

      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  describe("RoleRoute", () => {
    it("redirects if wrong role", () => {
      useAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { role: "guest" },
      });

      render(
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/listings" element={<div>Listings Page</div>} />
            <Route
              path="/admin"
              element={
                <RoleRoute roles={["admin"]}>
                  <div>Admin Content</div>
                </RoleRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Listings Page")).toBeInTheDocument();
      expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("allows if correct role", () => {
      useAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { role: "admin" },
      });

      render(
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleRoute roles={["admin"]}>
                  <div>Admin Content</div>
                </RoleRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
  });
});
