import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "../services/admin.service";

export const ADMIN_KEY = "admin";

// ── Platform statistics ────────────────────────────────────────────────────────

export function useAdminStats(opts = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "stats"],
    queryFn: () => adminService.getStats(),
    staleTime: 1000 * 60,
    ...opts,
  });
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export function useAdminAnalytics(params = {}, opts = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "analytics", params],
    queryFn: () => adminService.getAnalytics(params),
    staleTime: 1000 * 60,
    ...opts,
  });
}

// ── User management ───────────────────────────────────────────────────────────

export function useAdminUsers(params = {}, opts = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "users", params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...opts,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, isActive, reason }) =>
      adminService.updateUserStatus(username, isActive, reason),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [ADMIN_KEY, "users"] });
      qc.invalidateQueries({ queryKey: [ADMIN_KEY, "stats"] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message || "Failed to update user status"),
  });
}

// ── Listing moderation ─────────────────────────────────────────────────────────

export function useAdminListings(params = {}, opts = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "listings", params],
    queryFn: () => adminService.getListings(params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...opts,
  });
}

export function useUpdateListingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) =>
      adminService.updateListingStatus(id, status, reason),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [ADMIN_KEY, "listings"] });
      qc.invalidateQueries({ queryKey: [ADMIN_KEY, "stats"] });
      toast.success(data.message);
    },
    onError: (err) =>
      toast.error(err.message || "Failed to update listing status"),
  });
}

// ── Review moderation ──────────────────────────────────────────────────────────

export function useAdminReviews(params = {}, opts = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "reviews", params],
    queryFn: () => adminService.getReviews(params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...opts,
  });
}
