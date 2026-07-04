import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsService } from "../services/bookings.service";

export const BOOKINGS_KEY = "bookings";

export function useMyBookings(params = {}) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, params],
    queryFn: () => bookingsService.getAll(params),
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
      toast.success("Booking confirmed!");
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
