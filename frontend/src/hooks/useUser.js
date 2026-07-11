import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { useAuthStore } from "../store/auth.store";

export const USER_LISTINGS_KEY = "user-listings";
export const USER_PROFILE_KEY = "user-profile";
export const USER_PROFILE_FULL_KEY = "user-profile-full";
export const USER_REVIEWS_RECEIVED_KEY = "user-reviews-received";

// ── Queries ───────────────────────────────────────────────────────────────────

/** Full profile (includes phoneNumber, bio) — used to seed the edit form */
export function useUserProfile(username) {
  return useQuery({
    queryKey: [USER_PROFILE_KEY, username],
    queryFn: () => userService.getProfile(username),
    enabled: !!username,
    staleTime: 1000 * 60,
  });
}

/**
 * { user, hostStats } in one call — used by the redesigned profile page
 * (cover banner, stats cards, completion score, editable info card).
 */
export function useUserProfileFull(username) {
  return useQuery({
    queryKey: [USER_PROFILE_FULL_KEY, username],
    queryFn: () => userService.getProfileFull(username),
    enabled: !!username,
    staleTime: 1000 * 60,
  });
}

export function useUserListings(username) {
  return useQuery({
    queryKey: [USER_LISTINGS_KEY, username],
    queryFn: () => userService.getUserListings(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
  });
}

/** Paginated reviews received across all of a user's hosted listings */
export function useUserReviewsReceived(
  username,
  { page = 1, limit = 10 } = {},
) {
  return useQuery({
    queryKey: [USER_REVIEWS_RECEIVED_KEY, username, page, limit],
    queryFn: () => userService.getReviewsReceived(username, { page, limit }),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ── Profile mutations ───────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: ({ username, data }) =>
      userService.updateProfile(username, data),
    onSuccess: async (_updated, { username }) => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      qc.invalidateQueries({ queryKey: [USER_PROFILE_FULL_KEY, username] });
      toast.success("Profile updated successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to update profile"),
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: ({ username, file }) =>
      userService.updateAvatar(username, file),
    onSuccess: async (_updated, { username }) => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      qc.invalidateQueries({ queryKey: [USER_PROFILE_FULL_KEY, username] });
      toast.success("Profile photo updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update photo"),
  });
}

export function useRemoveAvatar() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: (username) => userService.removeAvatar(username),
    onSuccess: async (_updated, username) => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      qc.invalidateQueries({ queryKey: [USER_PROFILE_FULL_KEY, username] });
      toast.success("Profile photo removed");
    },
    onError: (err) => toast.error(err.message || "Failed to remove photo"),
  });
}

// ── Settings (theme, language, currency, privacy, 2FA preference) ────────────

export function useUpdateSettings() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: ({ username, settings }) =>
      userService.updateSettings(username, settings),
    onSuccess: async (_updated, { username }) => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_FULL_KEY, username] });
      toast.success("Settings updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update settings"),
  });
}

// ── Notification preferences ──────────────────────────────────────────────────

export function useUpdateNotificationPreferences() {
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: ({ username, prefs }) =>
      userService.updateNotificationPreferences(username, prefs),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Notification preferences updated");
    },
    onError: (err) =>
      toast.error(err.message || "Failed to update notification preferences"),
  });
}

// ── Account deletion ──────────────────────────────────────────────────────────

export function useDeleteAccount() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (username) => userService.deleteAccount(username),
    onSuccess: () => {
      // Session is destroyed server-side (req.logout inside the controller);
      // clear local auth + cache immediately rather than waiting on a /me roundtrip.
      useAuthStore.setState({ user: null, isAuthenticated: false });
      qc.clear();
      toast.success("Your account has been deleted");
      navigate("/", { replace: true });
    },
    onError: (err) => toast.error(err.message || "Failed to delete account"),
  });
}
