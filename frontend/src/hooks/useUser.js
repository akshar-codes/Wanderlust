import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { useAuthStore } from "../store/auth.store";

export const USER_LISTINGS_KEY = "user-listings";
export const USER_PROFILE_KEY = "user-profile";

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

export function useUserListings(username) {
  return useQuery({
    queryKey: [USER_LISTINGS_KEY, username],
    queryFn: () => userService.getUserListings(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: ({ username, data }) =>
      userService.updateProfile(username, data),
    onSuccess: async () => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
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
    onSuccess: async () => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
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
    onSuccess: async () => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      toast.success("Profile photo removed");
    },
    onError: (err) => toast.error(err.message || "Failed to remove photo"),
  });
}
