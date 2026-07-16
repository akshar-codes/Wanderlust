import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsService } from "../services/bookings.service";

export const BOOKINGS_KEY = "bookings";

// ── Guest ──────────────────────────────────────────────────────────────────

export function useMyBookings({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, "mine", params],
    queryFn: () => bookingsService.getAll(params),
    enabled,
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => bookingsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking request sent! The host will review it shortly.");
    },
    onError: (err) => toast.error(err.message || "Failed to create booking"),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingsService.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking cancelled");
    },
    onError: (err) => toast.error(err.message || "Failed to cancel booking"),
  });
}

// ── Host workflow ────────────────────────────────────────────────────────────

export function useHostBookings({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, "host", params],
    queryFn: () => bookingsService.getHostAll(params),
    enabled,
    staleTime: 1000 * 30,
    keepPreviousData: true,
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsService.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking confirmed");
    },
    onError: (err) => toast.error(err.message || "Failed to confirm booking"),
  });
}

export function useDeclineBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingsService.decline(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking declined");
    },
    onError: (err) => toast.error(err.message || "Failed to decline booking"),
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsService.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking marked as completed");
    },
    onError: (err) => toast.error(err.message || "Failed to update booking"),
  });
}

// ── Admin ──────────────────────────────────────────────────────────────────

export function useAdminBookings({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, "admin", params],
    queryFn: () => bookingsService.adminGetAll(params),
    enabled,
    staleTime: 1000 * 30,
    keepPreviousData: true,
  });
}

export function useAdminUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) =>
      bookingsService.adminUpdateStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      toast.success("Booking updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update booking"),
  });
}
